import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

const initialState = {
  courses: [],
  currentCourse: null,
  enrolledCourses: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    level: 'all',
    category: 'all',
    duration: 'all',
  },
  currentLesson: null,
  progress: {},
}

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count),
          enrollments:enrollments(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Fetch courses error:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in fetchCourses:', error)
      return rejectWithValue(error.message || 'Failed to fetch courses')
    }
  }
)

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      if (!courseId) {
        throw new Error('Course ID is required')
      }
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(*),
          resources:resources(*),
          quizzes:quizzes(*)
        `)
        .eq('id', courseId)
        .single()
      
      if (error) {
        console.error('Fetch course by ID error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Course not found')
      }
      
      return data
    } catch (error) {
      console.error('Error in fetchCourseById:', error)
      return rejectWithValue(error.message || 'Failed to fetch course')
    }
  }
)

export const enrollInCourse = createAsyncThunk(
  'courses/enrollInCourse',
  async ({ courseId, userId }, { rejectWithValue }) => {
    try {
      if (!courseId || !userId) {
        throw new Error('Course ID and User ID are required')
      }
      
      // Check if already enrolled - use maybeSingle() instead of single()
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle()
      
      if (checkError) {
        console.error('Check enrollment error:', checkError)
        throw checkError
      }
      
      if (existingEnrollment) {
        throw new Error('Already enrolled in this course')
      }
      
      const { data, error } = await supabase
        .from('enrollments')
        .insert([
          {
            course_id: courseId,
            user_id: userId,
            enrolled_at: new Date().toISOString(),
            progress: 0,
          }
        ])
        .select()
        .single()
      
      if (error) {
        console.error('Enrollment error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('No data returned from enrollment')
      }
      
      return data
    } catch (error) {
      console.error('Error in enrollInCourse:', error)
      return rejectWithValue(error.message || 'Failed to enroll in course')
    }
  }
)

export const fetchEnrolledCourses = createAsyncThunk(
  'courses/fetchEnrolledCourses',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      // First get enrollments with course data
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(
            *,
            lessons:lessons(id, duration_minutes)
          )
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false })
      
      if (enrollmentError) {
        console.error('Fetch enrolled courses error:', enrollmentError)
        throw enrollmentError
      }

      if (!enrollments || enrollments.length === 0) {
        return []
      }

      // Then get progress data for each enrollment with improved calculation
      const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            // Get lesson progress for this enrollment
            const { data: progressData, error: progressError } = await supabase
              .from('progress')
              .select('lesson_id, completed, progress, time_spent_minutes')
              .eq('enrollment_id', enrollment.id)

            if (progressError) {
              console.error('Error fetching progress for enrollment:', enrollment.id, progressError)
            }

            // Get assessment attempts for this enrollment
            const { data: assessmentAttempts, error: attemptError } = await supabase
              .from('assessment_attempts')
              .select('assessment_id, passed, score, completed_at')
              .eq('enrollment_id', enrollment.id)

            if (attemptError) {
              console.error('Error fetching assessment attempts for enrollment:', enrollment.id, attemptError)
            }

            const lessons = enrollment.course?.lessons || []
            const totalLessons = lessons.length
            const completedLessons = progressData?.filter(p => p.completed).length || 0
            
            // Calculate time-weighted progress
            let totalWeightedTime = 0
            let completedWeightedTime = 0
            
            // Process lessons
            lessons.forEach(lesson => {
              const lessonWeight = lesson.duration_minutes || 10
              totalWeightedTime += lessonWeight
              
              const lessonProgress = progressData?.find(p => p.lesson_id === lesson.id)
              if (lessonProgress?.completed) {
                completedWeightedTime += lessonWeight
              } else if (lessonProgress?.progress > 0) {
                completedWeightedTime += lessonWeight * (lessonProgress.progress / 100)
              }
            })
            
            // Process assessments (if any)
            const assessments = await supabase
              .from('assessments')
              .select('id, time_limit_minutes')
              .eq('course_id', enrollment.course_id)
              .then(({ data }) => data || [])
            
            assessments.forEach(assessment => {
              const assessmentWeight = assessment.time_limit_minutes || 30
              totalWeightedTime += assessmentWeight
              
              const attempt = assessmentAttempts?.find(a => a.assessment_id === assessment.id && a.completed_at)
              if (attempt?.passed) {
                completedWeightedTime += assessmentWeight
              } else if (attempt?.score > 0) {
                completedWeightedTime += assessmentWeight * (attempt.score / 100)
              }
            })

            // Calculate weighted progress percentage
            const calculatedProgress = totalWeightedTime > 0 ? 
              Math.round((completedWeightedTime / totalWeightedTime) * 100) : 0
            
            // Calculate hours spent from time_spent_minutes
            const totalMinutesSpent = progressData?.reduce((total, p) => total + (p.time_spent_minutes || 0), 0) || 0
            const hoursSpent = Math.round((totalMinutesSpent / 60) * 10) / 10

            return {
              ...enrollment,
              calculatedProgress,
              completedLessons,
              totalLessons,
              totalAssessments: assessments.length,
              totalContent: totalLessons + assessments.length,
              hoursSpent,
              progressData,
              assessmentAttempts
            }
          } catch (error) {
            console.error('Error processing enrollment:', enrollment.id, error)
            return {
              ...enrollment,
              calculatedProgress: 0,
              completedLessons: 0,
              totalLessons: enrollment.course?.lessons?.length || 0,
              totalAssessments: 0,
              totalContent: enrollment.course?.lessons?.length || 0,
              hoursSpent: 0
            }
          }
        })
      )
      
      return enrollmentsWithProgress
    } catch (error) {
      console.error('Error in fetchEnrolledCourses:', error)
      return rejectWithValue(error.message || 'Failed to fetch enrolled courses')
    }
  }
)

export const updateProgress = createAsyncThunk(
  'courses/updateProgress',
  async ({ enrollmentId, lessonId, progress, timeSpentMinutes }, { rejectWithValue }) => {
    try {
      if (!enrollmentId || !lessonId) {
        throw new Error('Enrollment ID and Lesson ID are required')
      }
      
      const progressValue = Math.max(0, Math.min(100, progress || 0))
      
      const { data, error } = await supabase
        .from('progress')
        .upsert([
          {
            enrollment_id: enrollmentId,
            lesson_id: lessonId,
            completed: progressValue === 100,
            progress: progressValue,
            time_spent_minutes: timeSpentMinutes || 0,
            completed_at: progressValue === 100 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()
      
      if (error) {
        console.error('Update progress error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('No data returned from progress update')
      }

      // Update enrollment overall progress
      await updateEnrollmentProgress(enrollmentId)
      
      return data
    } catch (error) {
      console.error('Error in updateProgress:', error)
      return rejectWithValue(error.message || 'Failed to update progress')
    }
  }
)

// Helper function to update enrollment progress with time-weighted calculation
const updateEnrollmentProgress = async (enrollmentId) => {
  try {
    // Get enrollment with course content
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        course_id,
        course:courses(
          lessons:lessons(id, duration_minutes, order_index),
          assessments:assessments(id, time_limit_minutes, order_index)
        )
      `)
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError) throw enrollmentError

    // Get all progress for this enrollment (lessons and assessments)
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('lesson_id, completed, progress, time_spent_minutes')
      .eq('enrollment_id', enrollmentId)

    if (progressError) throw progressError

    // Get assessment attempts for this enrollment
    const { data: assessmentAttempts, error: attemptError } = await supabase
      .from('assessment_attempts')
      .select('assessment_id, passed, score, completed_at')
      .eq('enrollment_id', enrollmentId)

    if (attemptError) throw attemptError

    const lessons = enrollment.course?.lessons || []
    const assessments = enrollment.course?.assessments || []
    
    // Calculate total weighted time for all content
    let totalWeightedTime = 0
    let completedWeightedTime = 0
    
    // Process lessons with their duration as weight
    lessons.forEach(lesson => {
      const lessonWeight = lesson.duration_minutes || 10 // Default 10 minutes if no duration
      totalWeightedTime += lessonWeight
      
      const lessonProgress = progressData?.find(p => p.lesson_id === lesson.id)
      if (lessonProgress?.completed) {
        completedWeightedTime += lessonWeight
      } else if (lessonProgress?.progress > 0) {
        // Partial progress weighted by completion percentage
        completedWeightedTime += lessonWeight * (lessonProgress.progress / 100)
      }
    })
    
    // Process assessments with their time limit as weight
    assessments.forEach(assessment => {
      const assessmentWeight = assessment.time_limit_minutes || 30 // Default 30 minutes if no time limit
      totalWeightedTime += assessmentWeight
      
      const attempt = assessmentAttempts?.find(a => a.assessment_id === assessment.id && a.completed_at)
      if (attempt?.passed) {
        completedWeightedTime += assessmentWeight
      } else if (attempt?.score > 0) {
        // Partial credit for incomplete but attempted assessments
        completedWeightedTime += assessmentWeight * (attempt.score / 100)
      }
    })

    // Calculate overall progress percentage
    const overallProgress = totalWeightedTime > 0 ? 
      Math.round((completedWeightedTime / totalWeightedTime) * 100) : 0

    // Update enrollment progress
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        progress: overallProgress,
        completed_at: overallProgress === 100 ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)

    if (updateError) throw updateError
    
    console.log(`Updated enrollment ${enrollmentId} progress: ${overallProgress}% (${completedWeightedTime}/${totalWeightedTime} weighted minutes)`)
  } catch (error) {
    console.error('Error updating enrollment progress:', error)
  }
}

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload || ''
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null
      state.currentLesson = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.courses = [] // Ensure courses is always an array
      })
      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false
        state.currentCourse = action.payload
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.currentCourse = null
      })
      // Enroll in Course
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.loading = false
        state.enrolledCourses.push(action.payload)
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Enrolled Courses
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false
        state.enrolledCourses = action.payload
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.enrolledCourses = [] // Ensure enrolledCourses is always an array
      })
      // Update Progress
      .addCase(updateProgress.pending, (state) => {
        state.error = null
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        if (action.payload && action.payload.lesson_id) {
          state.progress[action.payload.lesson_id] = action.payload
        }
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { 
  setSearchQuery, 
  setFilters, 
  setCurrentLesson, 
  clearCurrentCourse, 
  clearError 
} = courseSlice.actions

export default courseSlice.reducer