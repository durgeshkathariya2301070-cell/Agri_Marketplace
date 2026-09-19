import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getProfile } from "../services/api"

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      setAuthenticated(false)
      setChecking(false)
      return
    }

    try {
      const user = JSON.parse(storedUser)

      if (!user.token) {
        localStorage.removeItem("user")
        setAuthenticated(false)
        setChecking(false)
        return
      }
    } catch {
      localStorage.removeItem("user")
      setAuthenticated(false)
      setChecking(false)
      return
    }

    getProfile()
      .then(() => {
        setAuthenticated(true)
      })
      .catch(() => {
        localStorage.removeItem("user")
        setAuthenticated(false)
      })
      .finally(() => {
        setChecking(false)
      })
  }, [])

  if (checking) {
    return <div>Checking authentication...</div>
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute