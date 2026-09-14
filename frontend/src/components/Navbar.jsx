import { Link } from "react-router-dom"

function Navbar() {
 

  const user = JSON.parse(localStorage.getItem("user"))

  

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
        <Link to="/settings">Settings</Link>
      </div>

      <div className="navbar-user">
        <div className="navbar-profile">
          <span className="navbar-profile-icon">👤</span>
          <span className="navbar-profile-name">
            {user?.name || "User"}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar