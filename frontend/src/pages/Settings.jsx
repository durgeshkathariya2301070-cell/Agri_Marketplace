import { useNavigate } from "react-router-dom"

function Settings() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="page-container">
      <h1>Settings</h1>

      <div className="settings-card">

        <button
          className="settings-option"
          onClick={() => navigate("/profile")}
        >
          <span className="settings-option-icon">👤</span>

          <div className="settings-option-content">
            <h2>Profile</h2>
            <p>
              View and edit your personal account information
            </p>
          </div>
        </button>

        <button
          className="settings-option"
          onClick={() => navigate("/settings/order-history")}
        >
          <span className="settings-option-icon">📄</span>

          <div className="settings-option-content">
            <h2>Order History</h2>
            <p>
              Download your delivered buying or selling history
            </p>
          </div>
        </button>

        <button
          className="settings-option settings-logout-option"
          onClick={handleLogout}
        >
          <span className="settings-option-icon">🚪</span>

          <div className="settings-option-content">
            <h2>Logout</h2>
            <p>
              Sign out of your Agri Marketplace account
            </p>
          </div>
        </button>

      </div>
    </div>
  )
}

export default Settings