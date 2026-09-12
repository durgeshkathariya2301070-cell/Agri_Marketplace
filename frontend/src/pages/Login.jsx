import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "../services/api"
function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = await loginUser(email, password)

      localStorage.setItem("user", JSON.stringify(data))

      

      console.log("Login successful:", data)

      navigate("/dashboard")
    } catch (error) {
      alert(error.message)
      console.error("Login failed:", error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🌱 Agri Marketplace</h1>
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login