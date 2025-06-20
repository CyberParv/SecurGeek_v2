import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

const initialState = {
  user: null,
  session: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  profile: null,
  loginAttempts: 0,
  isLocked: false,
  lockoutTime: null,
}

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, firstName, lastName }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      })
      
      if (error) throw error
      
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState()
      
      // Check if account is locked
      if (state.auth.isLocked) {
        const lockoutTime = new Date(state.auth.lockoutTime)
        const now = new Date()
        const timeDiff = now - lockoutTime
        
        if (timeDiff < 15 * 60 * 1000) { // 15 minutes lockout
          throw new Error('Account is locked due to too many failed attempts. Please try again later.')
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Fetch profile after successful login
      if (data.user) {
        dispatch(fetchProfile(data.user.id))
      }
      
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setSession: (state, action) => {
      state.session = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1
      if (state.loginAttempts >= 5) {
        state.isLocked = true
        state.lockoutTime = new Date().toISOString()
      }
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0
      state.isLocked = false
      state.lockoutTime = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = !!action.payload.user
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = !!action.payload.user
        state.loginAttempts = 0
        state.isLocked = false
        state.lockoutTime = null
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.loginAttempts += 1
        if (state.loginAttempts >= 5) {
          state.isLocked = true
          state.lockoutTime = new Date().toISOString()
        }
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.session = null
        state.isAuthenticated = false
        state.profile = null
        state.loading = false
        state.error = null
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setUser, setSession, clearError, incrementLoginAttempts, resetLoginAttempts } = authSlice.actions
export default authSlice.reducer