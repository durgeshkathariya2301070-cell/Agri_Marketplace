import Navbar from "../components/Navbar"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import OrderCard from "../components/OrderCard"
import {
    getOrders,
    getDeliveries
} from "../services/api"

function Orders() {
    const location = useLocation()
    const [orders, setOrders] = useState([])
    const [deliveries, setDeliveries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [notification, setNotification] = useState("")

    const user = JSON.parse(localStorage.getItem("user"))

    const getBuyerMessage = (status) => {
        if (status === "pending") {
            return "⏳ Your order is pending farmer approval."
        }

        if (status === "accepted") {
            return "✅ Your order has been confirmed by the farmer."
        }

        if (status === "rejected") {
            return "❌ Your order was rejected by the farmer."
        }

        if (status === "ready") {
            return "📦 Your order is ready for delivery."
        }

        if (status === "in_transit") {
            return "🚚 Your order is on the way."
        }

        if (status === "delivered") {
            return "🎉 Your order has been delivered."
        }

        return ""
    }

    useEffect(() => {
        if (location.state?.orderPlaced) {
            setNotification(
                "✅ Order request sent successfully! Your order is pending now, wait for farmer decision."
            )
        }
    }, [location.state])

    console.log("Logged in user:", user)
    console.log("User ID:", user?.user_id, typeof user?.user_id)

    const fetchOrders = async () => {
        try {
            const [data, deliveriesData] = await Promise.all([
                getOrders(),
                getDeliveries()
            ])

            setDeliveries(deliveriesData)

            if (user?.role === "farmer") {
                const farmerOrders = data.filter(
                    (order) =>
                        Number(order.farmer_id) === Number(user.user_id) &&
                        !order.deleted_by_farmer
                )

                setOrders(farmerOrders)
            } else if (user?.role === "buyer") {
                const buyerOrders = data.filter(
                    (order) =>
                        Number(order.buyer_id) === Number(user.user_id) &&
                        !order.deleted_by_buyer
                )

                setOrders(buyerOrders)
            } else {
                setOrders([])
            }

            setLoading(false)
        } catch (err) {
            console.error("Failed to fetch orders:", err)
            setError(err.message)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [user?.role, user?.user_id])

    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders()
        }, 5000)

        return () => clearInterval(interval)
    }, [user?.role, user?.user_id])

    const handleStatusUpdate = (orderId, newStatus) => {
        setOrders(
            orders.map((order) =>
                order.id === orderId
                    ? { ...order, status: newStatus }
                    : order
            )
        )
    }

    const handleOrderDelete = (orderId) => {
        setOrders(
            orders.filter((order) => order.id !== orderId)
        )
    }

    const sortedOrders = [...orders].sort(
        (a, b) => Number(b.id) - Number(a.id)
    )

    return (
        <div>
            <Navbar />

            <main>
                <h1>
                    {user?.role === "farmer"
                        ? "Manage Orders 👨‍🌾"
                        : "My Orders 📦"}
                </h1>

                <p>
                    {user?.role === "farmer"
                        ? "View and manage orders for your products"
                        : "View and track your orders"}
                </p>

                {loading && (
                    <p>Loading orders...</p>
                )}

                {error && (
                    <p>{error}</p>
                )}

                {notification && (
                    <div className="order-notification">
                        {notification}
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <p>
                        {user?.role === "farmer"
                            ? "No orders for your products."
                            : "No orders available."}
                    </p>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="orders-grid">
                        {sortedOrders.map((order) => (
                            <div key={order.id}>
                                {user?.role === "buyer" && (
                                    <div className="order-notification">
                                        {getBuyerMessage(order.status)}
                                    </div>
                                )}

                                <OrderCard
                                    order={order}
                                    user={user}
                                    delivery={deliveries.find(
                                        (delivery) => delivery.order_id === order.id
                                    )}
                                    onStatusUpdate={handleStatusUpdate}
                                    onDelete={handleOrderDelete}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Orders
