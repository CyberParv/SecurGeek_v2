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
    roleDistribution: {},
    coursePopularity: [],
  },
  detailedAnalytics: {
    coursePopularity: [],
    userRoleDistribution: [],
    enrollmentTrends: [],
    revenueByCategory: [],
    completionRates: [],
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

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('User ID is required')
      }
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      // Use maybeSingle() instead of single() to handle cases where no rows are returned
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle()
      
      if (error) {
        console.error('Update user error:', error)
        throw error
      }
      
      // If no data is returned, it means the user wasn't found or couldn't be updated
      if (!data) {
        throw new Error('User not found or could not be updated. Please check permissions.')
      }
      
      return data
    } catch (error) {
      console.error('Error in updateUser:', error)
      return rejectWithValue(error.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (error) {
        console.error('Delete user error:', error)
        throw error
      }
      
      return userId
    } catch (error) {
      console.error('Error in deleteUser:', error)
      return rejectWithValue(error.message || 'Failed to delete user')
    }
  }
)

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const insertData = {
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([insertData])
        .select()
        .maybeSingle()
      
      if (error) {
        console.error('Create user error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('User could not be created')
      }
      
      return data
    } catch (error) {
      console.error('Error in createUser:', error)
      return rejectWithValue(error.message || 'Failed to create user')
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
      console.log('Starting analytics fetch...')
      
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
      
      console.log('Basic counts:', { usersCount, coursesCount, enrollmentsCount })
      
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
          console.log('Recent activity fetched:', recentActivity.length, 'items')
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
          console.log('Total revenue calculated:', totalRevenue)
        }
      } catch (error) {
        console.error('Error calculating revenue:', error)
      }

      // Fetch role distribution
      let roleDistribution = {}
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('role')
        
        if (profilesError) {
          console.error('Role distribution fetch error:', profilesError)
        } else {
          roleDistribution = (profiles || []).reduce((acc, profile) => {
            const role = profile.role || 'student'
            acc[role] = (acc[role] || 0) + 1
            return acc
          }, {})
          console.log('Role distribution:', roleDistribution)
        }
      } catch (error) {
        console.error('Error fetching role distribution:', error)
      }

      // Fetch course popularity
      let coursePopularity = []
      try {
        const { data: popularCourses, error: popularCoursesError } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            enrollments:enrollments(count)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (popularCoursesError) {
          console.error('Course popularity fetch error:', popularCoursesError)
        } else {
          coursePopularity = (popularCourses || []).map(course => ({
            id: course.id,
            title: course.title,
            enrollments: course.enrollments?.[0]?.count || 0
          })).sort((a, b) => b.enrollments - a.enrollments)
          console.log('Course popularity:', coursePopularity.length, 'courses')
        }
      } catch (error) {
        console.error('Error fetching course popularity:', error)
      }
      
      const result = {
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalEnrollments: enrollmentsCount || 0,
        totalRevenue: totalRevenue.toFixed(2),
        recentActivity,
        roleDistribution,
        coursePopularity,
      }
      
      console.log('Analytics result:', result)
      return result
    } catch (error) {
      console.error('Error in fetchAnalytics:', error)
      return rejectWithValue(error.message || 'Failed to fetch analytics')
    }
  }
)

export const fetchDetailedAnalytics = createAsyncThunk(
  'admin/fetchDetailedAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching detailed analytics...')
      
      // Fetch course popularity (courses with most enrollments)
      let coursePopularity = []
      try {
        const { data: popularCourses, error: popularCoursesError } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            enrollments:enrollments(count)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (popularCoursesError) {
          console.error('Course popularity fetch error:', popularCoursesError)
        } else {
          coursePopularity = (popularCourses || []).map(course => ({
            id: course.id,
            title: course.title,
            enrollments: course.enrollments?.[0]?.count || 0
          })).sort((a, b) => b.enrollments - a.enrollments)
        }
      } catch (error) {
        console.error('Error fetching course popularity:', error)
      }

      // Fetch user role distribution
      let userRoleDistribution = []
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('profiles')
          .select('role')
        
        if (roleError) {
          console.error('User role distribution fetch error:', roleError)
        } else {
          const roleCounts = (roleData || []).reduce((acc, user) => {
            const role = user.role || 'student'
            acc[role] = (acc[role] || 0) + 1
            return acc
          }, {})
          
          userRoleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
            role,
            count
          }))
        }
      } catch (error) {
        console.error('Error fetching user role distribution:', error)
      }

      // Fetch enrollment trends (enrollments over time)
      let enrollmentTrends = []
      try {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('enrolled_at')
          .order('enrolled_at', { ascending: true })
        
        if (enrollmentError) {
          console.error('Enrollment trends fetch error:', enrollmentError)
        } else {
          // Group enrollments by month
          const monthlyEnrollments = (enrollmentData || []).reduce((acc, enrollment) => {
            const date = new Date(enrollment.enrolled_at)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            acc[monthKey] = (acc[monthKey] || 0) + 1
            return acc
          }, {})
          
          enrollmentTrends = Object.entries(monthlyEnrollments).map(([month, count]) => ({
            month,
            enrollments: count
          }))
        }
      } catch (error) {
        console.error('Error fetching enrollment trends:', error)
      }

      // Fetch revenue by category
      let revenueByCategory = []
      try {
        const { data: categoryRevenue, error: categoryError } = await supabase
          .from('courses')
          .select(`
            price,
            category:categories(name)
          `)
        
        if (categoryError) {
          console.error('Revenue by category fetch error:', categoryError)
        } else {
          const categoryTotals = (categoryRevenue || []).reduce((acc, course) => {
            const categoryName = course.category?.name || 'Uncategorized'
            const price = parseFloat(course.price) || 0
            acc[categoryName] = (acc[categoryName] || 0) + price
            return acc
          }, {})
          
          revenueByCategory = Object.entries(categoryTotals).map(([category, revenue]) => ({
            category,
            revenue: revenue.toFixed(2)
          }))
        }
      } catch (error) {
        console.error('Error fetching revenue by category:', error)
      }

      // Fetch completion rates
      let completionRates = []
      try {
        const { data: completionData, error: completionError } = await supabase
          .from('enrollments')
          .select(`
            completed_at,
            course:courses(title)
          `)
        
        if (completionError) {
          console.error('Completion rates fetch error:', completionError)
        } else {
          const courseCompletions = (completionData || []).reduce((acc, enrollment) => {
            const courseTitle = enrollment.course?.title || 'Unknown Course'
            if (!acc[courseTitle]) {
              acc[courseTitle] = { total: 0, completed: 0 }
            }
            acc[courseTitle].total += 1
            if (enrollment.completed_at) {
              acc[courseTitle].completed += 1
            }
            return acc
          }, {})
          
          completionRates = Object.entries(courseCompletions).map(([course, stats]) => ({
            course,
            completionRate: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0.0',
            totalEnrollments: stats.total,
            completedEnrollments: stats.completed
          }))
        }
      } catch (error) {
        console.error('Error fetching completion rates:', error)
      }

      const result = {
        coursePopularity,
        userRoleDistribution,
        enrollmentTrends,
        revenueByCategory,
        completionRates,
      }
      
      console.log('Detailed analytics result:', result)
      return result
    } catch (error) {
      console.error('Error in fetchDetailedAnalytics:', error)
      return rejectWithValue(error.message || 'Failed to fetch detailed analytics')
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
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter(user => user.id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.unshift(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
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
      // Fetch Detailed Analytics
      .addCase(fetchDetailedAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDetailedAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.detailedAnalytics = action.payload
      })
      .addCase(fetchDetailedAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Keep existing detailed analytics data on error
      })
  },
})

export const { setSelectedCourse, setSelectedUser, clearError } = adminSlice.actions
export default adminSlice.reducer