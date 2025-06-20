import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

const initialState = {
  users: [],
  courses: [],
  analytics: {
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    recentActivity: [],
  },
  loading: false,
  error: null,
  selectedCourse: null,
  selectedUser: null,
}

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          enrollments:enrollments(count)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Fetch users error:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in fetchAllUsers:', error)
      return rejectWithValue(error.message || 'Failed to fetch users')
    }
  }
)

export const fetchAllCourses = createAsyncThunk(
  'admin/fetchAllCourses',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count),
          enrollments:enrollments(count)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Fetch courses error:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in fetchAllCourses:', error)
      return rejectWithValue(error.message || 'Failed to fetch courses')
    }
  }
)

export const createCourse = createAsyncThunk(
  'admin/createCourse',
  async (courseData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      
      if (!auth.user?.id) {
        throw new Error('User not authenticated')
      }
      
      const insertData = {
        ...courseData,
        instructor_id: auth.user.id, // Set current admin as instructor
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('courses')
        .insert([insertData])
        .select()
        .single()
      
      if (error) {
        console.error('Create course error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('No data returned from course creation')
      }
      
      return data
    } catch (error) {
      console.error('Error in createCourse:', error)
      return rejectWithValue(error.message || 'Failed to create course')
    }
  }
)

export const updateCourse = createAsyncThunk(
  'admin/updateCourse',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Course ID is required')
      }
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Update course error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Course not found or could not be updated')
      }
      
      return data
    } catch (error) {
      console.error('Error in updateCourse:', error)
      return rejectWithValue(error.message || 'Failed to update course')
    }
  }
)

export const deleteCourse = createAsyncThunk(
  'admin/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      if (!courseId) {
        throw new Error('Course ID is required')
      }
      
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
      
      if (error) {
        console.error('Delete course error:', error)
        throw error
      }
      
      return courseId
    } catch (error) {
      console.error('Error in deleteCourse:', error)
      return rejectWithValue(error.message || 'Failed to delete course')
    }
  }
)

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch total counts with proper error handling
      const [usersResult, coursesResult, enrollmentsResult] = await Promise.allSettled([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      ])
      
      // Extract counts with fallbacks
      const usersCount = usersResult.status === 'fulfilled' ? usersResult.value.count : 0
      const coursesCount = coursesResult.status === 'fulfilled' ? coursesResult.value.count : 0
      const enrollmentsCount = enrollmentsResult.status === 'fulfilled' ? enrollmentsResult.value.count : 0
      
      // Fetch recent activity with error handling
      let recentActivity = []
      try {
        const { data: activityData, error: activityError } = await supabase
          .from('enrollments')
          .select(`
            *,
            user:profiles(first_name, last_name),
            course:courses(title)
          `)
          .order('enrolled_at', { ascending: false })
          .limit(10)
        
        if (activityError) {
          console.error('Recent activity fetch error:', activityError)
        } else {
          recentActivity = activityData || []
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error)
      }
      
      // Calculate revenue with error handling
      let totalRevenue = 0
      try {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('price')
        
        if (coursesError) {
          console.error('Revenue calculation error:', coursesError)
        } else {
          totalRevenue = (courses || []).reduce((sum, course) => {
            const price = parseFloat(course.price) || 0
            return sum + price
          }, 0)
        }
      } catch (error) {
        console.error('Error calculating revenue:', error)
      }
      
      return {
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalEnrollments: enrollmentsCount || 0,
        totalRevenue: totalRevenue.toFixed(2),
        recentActivity,
      }
    } catch (error) {
      console.error('Error in fetchAnalytics:', error)
      return rejectWithValue(error.message || 'Failed to fetch analytics')
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.users = [] // Ensure users is always an array
      })
      // Fetch All Courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.courses = [] // Ensure courses is always an array
      })
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false
        state.courses.unshift(action.payload)
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false
        const index = state.courses.findIndex(course => course.id === action.payload.id)
        if (index !== -1) {
          state.courses[index] = action.payload
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false
        state.courses = state.courses.filter(course => course.id !== action.payload)
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.analytics = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Keep existing analytics data on error
      })
  },
})

export const { setSelectedCourse, setSelectedUser, clearError } = adminSlice.actions
export default adminSlice.reducer