import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import courseSlice from './slices/courseSlice'
import uiSlice from './slices/uiSlice'
import adminSlice from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: courseSlice,
    ui: uiSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export default store