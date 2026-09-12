import Navbar from "../components/Navbar"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getProducts, getOrders } from "../services/api"

function FarmerDashboard() {
    const user = JSON.parse(localStorage.getItem("user"))

    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        Promise.all([
            getProducts(),
            getOrders()
        ])
            .then(([productsData, ordersData]) => {
                setProducts(productsData || [])
                setOrders(ordersData || [])
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching farmer dashboard data:", err)
                setError("Unable to load latest data from the server.")
                setLoading(false)
            })
    }, [])

    const myProducts = products.filter(
        (product) =>
            Number(product.farmer_id) === Number(user?.user_id)
    )

    const myOrders = orders.filter(
        (order) =>
            Number(order.farmer_id) === Number(user?.user_id) &&
            !order.deleted_by_farmer
    )

    const myPendingOrders = myOrders.filter(
        (order) => order.status === "pending"
    )

    const totalInventory = myProducts.reduce(
        (total, product) =>
            total + (Number(product.quantity) || 0),
        0
    )

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-main">

                <header className="dashboard-header">
                    <div className="dashboard-header-text">
                        <h1>Farmer Dashboard 🌱</h1>

                        <p>
                            Welcome,{" "}
                            <strong>{user?.name || "Farmer"}</strong>!
                        </p>

                        <p>
                            Manage your products, orders, inventory and
                            agricultural logistics.
                        </p>
                    </div>
                </header>

                {error && (
                    <div className="dashboard-alert">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <section className="dashboard-section-block">

                    <div className="section-header">
                        <h2>My Marketplace Overview</h2>
                    </div>

                    <div className="dashboard-stats">

                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-icon">🌾</span>
                                <h3>My Products</h3>
                            </div>

                            <strong className="stat-value">
                                {loading ? "..." : myProducts.length}
                            </strong>

                            <p className="stat-desc">
                                Products listed by you
                            </p>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-icon">📦</span>
                                <h3>My Orders</h3>
                            </div>

                            <strong className="stat-value">
                                {loading ? "..." : myOrders.length}
                            </strong>

                            <p className="stat-desc">
                                Orders for your products
                            </p>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-icon">⏳</span>
                                <h3>Pending Orders</h3>
                            </div>

                            <strong className="stat-value">
                                {loading ? "..." : myPendingOrders.length}
                            </strong>

                            <p className="stat-desc">
                                Orders waiting for action
                            </p>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-icon">📊</span>
                                <h3>My Inventory</h3>
                            </div>

                            <strong className="stat-value">
                                {loading ? "..." : totalInventory}
                            </strong>

                            <p className="stat-desc">
                                Total available quantity
                            </p>
                        </div>

                    </div>
                </section>

                <section className="dashboard-section-block">

                    <div className="section-header">
                        <h2>Quick Actions</h2>
                    </div>

                    <div className="quick-actions-grid">

                        <Link
                            to="/products"
                            className="quick-action-card"
                        >
                            <div className="quick-action-left">
                                <span className="quick-action-icon">
                                    🌾
                                </span>

                                <div className="quick-action-info">
                                    <h3>Manage Products</h3>
                                    <p>
                                        Add and manage your agricultural
                                        products
                                    </p>
                                </div>
                            </div>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </Link>

                        <Link
                            to="/orders"
                            className="quick-action-card"
                        >
                            <div className="quick-action-left">
                                <span className="quick-action-icon">
                                    📋
                                </span>

                                <div className="quick-action-info">
                                    <h3>Manage Orders</h3>
                                    <p>
                                        Accept and manage buyer orders
                                    </p>
                                </div>
                            </div>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </Link>

                        <Link
                            to="/deliveries"
                            className="quick-action-card"
                        >
                            <div className="quick-action-left">
                                <span className="quick-action-icon">
                                    🚚
                                </span>

                                <div className="quick-action-info">
                                    <h3>Manage Deliveries</h3>
                                    <p>
                                        Optimize routes and dispatch
                                        deliveries
                                    </p>
                                </div>
                            </div>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </Link>

                        <Link
                            to="/forecast"
                            className="quick-action-card"
                        >
                            <div className="quick-action-left">
                                <span className="quick-action-icon">
                                    🤖
                                </span>

                                <div className="quick-action-info">
                                    <h3>AI Demand Forecast</h3>
                                    <p>
                                        Predict future agricultural demand
                                    </p>
                                </div>
                            </div>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </Link>

                    </div>
                </section>

                <section className="dashboard-section-block">

                    <div className="section-header">
                        <h2>Core Modules</h2>
                    </div>

                    <div className="dashboard-sections">

                        <div className="dashboard-section">
                            <div className="feature-card-content">
                                <h2>Marketplace 🛒</h2>

                                <p>
                                    Manage your agricultural products and
                                    connect with buyers through the
                                    marketplace.
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="feature-card-content">
                                <h2>AI Logistics 🚚</h2>

                                <p>
                                    Optimize delivery routes to reduce
                                    transportation time and improve
                                    logistics efficiency.
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="feature-card-content">
                                <h2>AI Demand Forecast 🤖</h2>

                                <p>
                                    Predict future agricultural demand to
                                    help plan production and inventory.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

            </main>
        </div>
    )
}

export default FarmerDashboard