import { Link, useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        🌱 Agri Marketplace
      </Link>

      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/products">Products</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/deliveries">Deliveries</Link>
        <Link to="/forecast">Forecast</Link>
      </div>

      <div className="navbar-user">
        <div className="navbar-profile">
          <span className="navbar-profile-icon">👤</span>
          <span className="navbar-profile-name">{user?.name || "User"}</span>
        </div>
        <button className="navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar