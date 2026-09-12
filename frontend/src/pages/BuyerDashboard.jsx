import Navbar from "../components/Navbar"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getProducts, getOrders } from "../services/api"

function BuyerDashboard() {
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
                console.error("Error fetching buyer dashboard data:", err)
                setError("Unable to load latest data from the server.")
                setLoading(false)
            })
    }, [])

    const availableProducts = products.filter(
        (product) => Number(product.quantity) > 0
    )

    const myOrders = orders.filter(
        (order) =>
            Number(order.buyer_id) === Number(user?.user_id) &&
            !order.deleted_by_buyer
    )

    const myPendingOrders = myOrders.filter(
        (order) => order.status === "pending"
    )

    const myInTransitOrders = myOrders.filter(
        (order) => order.status === "in_transit"
    )

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-main">

                <header className="dashboard-header">
                    <div className="dashboard-header-text">
                        <h1>Buyer Dashboard 🛒</h1>

                        <p>
                            Welcome,{" "}
                            <strong>{user?.name || "Buyer"}</strong>!
                        </p>

                        <p>
                            Browse agricultural products, place orders and
                            track your deliveries.
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
                                <h3>Available Products</h3>
                            </div>

                            <strong className="stat-value">
                                {loading ? "..." : availableProducts.length}
                            </strong>

                            <p className="stat-desc">
                                Products available to buy
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
                                Orders placed by you
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
                                Orders waiting for confirmation
                            </p>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-icon">🚚</span>
                                <h3>In Transit</h3>
                            </div>

                            <strong className="stat-value">
                                {loading ? "..." : myInTransitOrders.length}
                            </strong>

                            <p className="stat-desc">
                                Orders currently being delivered
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
                                    🛒
                                </span>

                                <div className="quick-action-info">
                                    <h3>Browse Products</h3>

                                    <p>
                                        Explore agricultural products
                                        available for purchase
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
                                    <h3>My Orders</h3>

                                    <p>
                                        View and track your orders
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
                                    <h3>Track Deliveries</h3>

                                    <p>
                                        Track your agricultural deliveries
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
                                        Explore agricultural demand
                                        predictions
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
                                    Browse products from farmers and
                                    purchase fresh agricultural produce.
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="feature-card-content">
                                <h2>AI Logistics 🚚</h2>

                                <p>
                                    Track your order deliveries and view
                                    optimized transportation routes.
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="feature-card-content">
                                <h2>AI Demand Forecast 🤖</h2>

                                <p>
                                    Use AI-powered demand predictions to
                                    understand future agricultural demand.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

            </main>
        </div>
    )
}

export default BuyerDashboard