import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openModal } from '../../store/slices/uiSlice'
import { useEffect } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openModal('login'))
    }
  }, [isAuthenticated, dispatch])

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute