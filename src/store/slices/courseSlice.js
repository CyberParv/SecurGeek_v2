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
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false })
      
      if (error) {
        console.error('Fetch enrolled courses error:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in fetchEnrolledCourses:', error)
      return rejectWithValue(error.message || 'Failed to fetch enrolled courses')
    }
  }
)

export const updateProgress = createAsyncThunk(
  'courses/updateProgress',
  async ({ enrollmentId, lessonId, progress }, { rejectWithValue }) => {
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
      
      return data
    } catch (error) {
      console.error('Error in updateProgress:', error)
      return rejectWithValue(error.message || 'Failed to update progress')
    }
  }
)

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