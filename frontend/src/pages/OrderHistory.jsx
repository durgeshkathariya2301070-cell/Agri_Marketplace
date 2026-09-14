import { downloadOrderHistory } from "../services/api"

function OrderHistory() {
  const handleDownload = async () => {
    try {
      await downloadOrderHistory()
    } catch (error) {
      alert("Failed to download order history")
    }
  }

  return (
    <div className="page-container">
      <h1>Order History</h1>

      <div className="settings-card">
        <h2>Delivered Orders</h2>

        <p>
          Download your completed buying or selling history.
        </p>

        <button onClick={handleDownload}>
          Download Delivered Orders CSV
        </button>
      </div>
    </div>
  )
}

export default OrderHistory