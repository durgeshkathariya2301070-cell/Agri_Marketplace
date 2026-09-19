import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import {
    acceptOrder,
    rejectOrder,
    markOrderReady,
    markOrderInTransit,
    markOrderDelivered,
    confirmOrderReceived,
    rejectOrderReceived,
    deleteOrder,
    updateDeliveryLocation
} from "../services/api"

function OrderCard({
    order,
    user,
    delivery,
    onStatusUpdate,
    onDelete
}) {

    const [showDetails, setShowDetails] = useState(false)
    const [vehicleCapacity, setVehicleCapacity] = useState(() => {
        const quantity = Number(order.quantity)

        return [100, 250, 500, 1000, 5000]
            .find((capacity) => capacity >= quantity) || quantity
    })

    useEffect(() => {
        const quantity = Number(order.quantity)

        const suitableCapacity = [100, 250, 500, 1000, 5000]
            .find((capacity) => capacity >= quantity) || quantity

        setVehicleCapacity(suitableCapacity)
    }, [order.quantity])
    
    const navigate = useNavigate();
    console.log("ORDER CARD FILE LOADED")
    useEffect(() => {
        console.log("GPS CHECK")
        console.log("Role:", user?.role)
        console.log("Order status:", order.status)
        console.log("Delivery:", delivery)
        console.log("Delivery ID:", delivery?.id)

        if (user?.role !== "farmer") {
            console.log("GPS STOP: user is not farmer")
            return
        }

        if (order.status !== "in_transit") {
            console.log("GPS STOP: order is not in transit")
            return
        }

        if (!delivery?.id) {
            console.log("GPS STOP: delivery ID is missing")
            return
        }

        if (!navigator.geolocation) {
            console.log("GPS STOP: geolocation not supported")
            return
        }

        console.log("GPS STARTING")

        let lastSentTime = 0

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const now = Date.now()

                if (now - lastSentTime < 5000) {
                    return
                }

                lastSentTime = now

                const latitude = position.coords.latitude
                const longitude = position.coords.longitude

                console.log(
                    "GPS POSITION:",
                    latitude,
                    longitude
                )

                try {
                    const result = await updateDeliveryLocation(
                        delivery.id,
                        latitude,
                        longitude
                    )

                    console.log(
                        "Farmer GPS location sent:",
                        result
                    )
                } catch (error) {
                    console.error(
                        "GPS UPLOAD ERROR:",
                        error
                    )
                }
            },
            (error) => {
                console.error(
                    "GPS POSITION ERROR:",
                    error.code,
                    error.message
                )
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
            console.log("GPS WATCH STOPPED")
        }
    }, [user?.role, order.status, delivery?.id])

    const handleAccept = async () => {
        try {
            const updatedOrder = await acceptOrder(order.id)
            onStatusUpdate(order.id, updatedOrder.status)
        } catch (error) {
            console.error("Failed to accept order:", error)
            alert(error.message)
        }
    }

    const handleReject = async () => {
        try {
            const updatedOrder = await rejectOrder(order.id)
            onStatusUpdate(order.id, updatedOrder.status)
        } catch (error) {
            console.error("Failed to reject order:", error)
            alert(error.message)
        }
    }

    const handleReady = async () => {
        try {
            const updatedOrder = await markOrderReady(
                order.id,
                vehicleCapacity
            )
            onStatusUpdate(order.id, updatedOrder.status)
        } catch (error) {
            console.error("Failed to mark order as ready:", error)
            alert(error.message)
        }
    }

    const handleInTransit = async () => {
        try {
            const updatedOrder = await markOrderInTransit(order.id)
            onStatusUpdate(order.id, updatedOrder.status)
        } catch (error) {
            console.error("Failed to mark order as in transit:", error)
            alert(error.message)
        }
    }

    const handleDelivered = async () => {
        try {
            const updatedOrder = await markOrderDelivered(order.id)
            onStatusUpdate(order.id, updatedOrder.status)
        } catch (error) {
            console.error("Failed to mark order as delivered:", error)
            alert(error.message)
        }
    }

    const handleConfirmReceived = async () => {
        try {
            const updatedOrder = await confirmOrderReceived(order.id)
            onStatusUpdate(order.id, updatedOrder.status)
        } catch (error) {
            console.error("Failed to confirm order received:", error)
            alert(error.message)
        }
    }

    const handleNotReceived = async () => {
        try {
            const updatedOrder = await rejectOrderReceived(order.id)
            onStatusUpdate(order.id, updatedOrder.status)
        } catch (error) {
            console.error("Failed to report order not received:", error)
            alert(error.message)
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this old order?"
        )

        if (!confirmed) {
            return
        }

        try {
            await deleteOrder(order.id)
            onDelete(order.id)
        } catch (error) {
            console.error("Failed to delete order:", error)
            alert(error.message)
        }
    }

    const statuses = [
        "pending",
        "accepted",
        "ready",
        "in_transit",
        "delivered"
    ]

    const currentIndex = statuses.indexOf(order.status)

    const getStatusLabel = (status) => {
        if (status === "in_transit") return "In Transit"
        if (status === "delivery_confirmation_pending") {
            return "Awaiting Buyer Confirmation"
        }

        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    return (
        <div className="order-card">

            <div className="order-card-header">
                <div>
                    <span className="order-label">ORDER</span>
                    <h2>#{order.id}</h2>
                </div>

                <span className={`order-status status-${order.status}`}>
                    {getStatusLabel(order.status)}
                </span>
            </div>

            <div className="order-product">
                <div className="product-icon">🌱</div>

                <div>
                    <span className="info-label">PRODUCT</span>
                    <h3>{order.product_name}</h3>
                    <p>Product ID: {order.product_id}</p>
                </div>
            </div>

            <div className="order-info-grid">

                <div className="order-info-box">
                    <span>QUANTITY</span>
                    <strong>{order.quantity}</strong>
                </div>

                <div className="order-info-box">
                    <span>TOTAL PRICE</span>
                    <strong>₹{order.total_price}</strong>
                </div>

            </div>

            <div className="order-progress">

                <div className="progress-title">
                    <span>ORDER PROGRESS</span>
                    <strong>{getStatusLabel(order.status)}</strong>
                </div>

                <div className="status-timeline">

                    {statuses.map((status, index) => {
                        const completed = index <= currentIndex
                        const active = index === currentIndex

                        return (
                            <div
                                className={`status-step ${completed ? "completed" : ""
                                    } ${active ? "active" : ""}`}
                                key={status}
                            >

                                <div className="status-dot">
                                    {completed ? "✓" : index + 1}
                                </div>

                                <span>
                                    {getStatusLabel(status)}
                                </span>

                            </div>
                        )
                    })}

                </div>
            </div>

            {user?.role === "farmer" && order.status === "pending" && (
                <div className="order-actions">

                    <button
                        className="accept-button"
                        onClick={handleAccept}
                    >
                        ✓ Accept Order
                    </button>

                    <button
                        className="reject-button"
                        onClick={handleReject}
                    >
                        ✕ Reject
                    </button>

                </div>
            )}

            {user?.role === "farmer" && order.status === "accepted" && (
                <div className="vehicle-capacity-section">
                    <label>
                        Vehicle Capacity
                    </label>

                    <small>
                        Select the maximum weight your delivery vehicle can carry.
                    </small>

                    <select
                        value={vehicleCapacity}
                        onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                    >
                        {[100, 250, 500, 1000, 5000]
                            .filter((capacity) => capacity >= Number(order.quantity))
                            .map((capacity) => (
                                <option key={capacity} value={capacity}>
                                    {capacity} kg
                                </option>
                            ))}
                        {Number(order.quantity) > 1000 && (
                            <option value={Number(order.quantity)}>
                                {Number(order.quantity)} kg (required)
                            </option>
                        )}
                    </select>
                    <button onClick={handleReady}>
                        📦 Mark Ready
                    </button>

                </div>
            )}

            {user?.role === "farmer" && order.status === "ready" && (
                <div className="order-actions">

                    <button onClick={handleInTransit}>
                        🚚 Start Delivery
                    </button>

                </div>
            )}

            {user?.role === "farmer" && order.status === "in_transit" && (
                <div className="order-actions">

                    <button onClick={handleDelivered}>
                        ✓ Mark Delivered
                    </button>

                </div>
            )}

            {user?.role === "buyer" &&
                order.status === "delivery_confirmation_pending" && (
                    <div className="order-actions">
                        <p>
                            📦 Did you receive your order?
                        </p>

                        <button onClick={handleConfirmReceived}>
                            ✓ Yes, I received it
                        </button>

                        <button onClick={handleNotReceived}>
                            ✕ No, I did not receive it
                        </button>
                    </div>
                )}

            {user?.role === "farmer" &&
                delivery &&
                delivery.status !== "delivered" && (
                    <div className="view-order-action">
                        <button
                            className="view-route-button"
                            onClick={() => {
                                window.location.href = "/deliveries"
                            }}
                        >
                            🚚 View Delivery / Optimize Route
                        </button>
                    </div>
                )}

            <div className="view-order-action">

                <button
                    className="view-order-button"
                    onClick={() => setShowDetails(true)}
                >
                    View Order
                </button>
                {/* Buyer Track Order Button */}
                {user?.role === "buyer" &&
                    order.status === "in_transit" &&
                    delivery?.id && (
                        <div className="track-order-action">
                            <button
                                className="track-order-button"
                                onClick={() =>
                                    navigate(
                                        `/deliveries/${delivery.id}/map`,
                                        {
                                            state: {
                                                delivery: delivery
                                            }
                                        }
                                    )
                                }
                            >
                                📍 Track Order
                            </button>
                        </div>
                    )}
                {/* Farmer View Route Button */}
                {delivery?.route &&
                    delivery?.road_coordinates &&
                    delivery.road_coordinates.length > 0 &&
                    !(user?.role === "buyer" && order.status === "in_transit") && (
                        <button
                            onClick={() =>
                                navigate(
                                    `/deliveries/${delivery.id}/map`,
                                    {
                                        state: { delivery: delivery }
                                    }
                                )
                            }
                        >
                            🗺️ View Route on Map
                        </button>
                    )}
            </div>

            {(order.status === "delivered" ||
                order.status === "rejected") && (

                    <div className="view-order-action">

                        <button
                            className="delete-order-button"
                            onClick={handleDelete}
                        >
                            🗑️ Delete Old Order
                        </button>

                    </div>
                )}

            {showDetails && (
                <div className="order-modal-overlay">

                    <div className="order-modal">

                        <div className="order-modal-header">
                            <div>
                                <span className="order-label">
                                    ORDER DETAILS
                                </span>

                                <h2>Order #{order.id}</h2>
                            </div>

                            <button
                                className="close-modal-button"
                                onClick={() => setShowDetails(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-product">
                            <span className="info-label">PRODUCT</span>
                            <h3>{order.product_name}</h3>
                        </div>

                        <div className="modal-details-grid">

                            <div>
                                <span>PRODUCT ID</span>
                                <strong>{order.product_id}</strong>
                            </div>

                            <div>
                                <span>QUANTITY</span>
                                <strong>{order.quantity}</strong>
                            </div>

                            <div>
                                <span>TOTAL PRICE</span>
                                <strong>₹{order.total_price}</strong>
                            </div>

                            <div>
                                <span>STATUS</span>
                                <strong>
                                    {getStatusLabel(order.status)}
                                </strong>
                            </div>

                            <div>
                                <span>BUYER ID</span>
                                <strong>{order.buyer_id}</strong>
                            </div>

                            <div>
                                <span>FARMER ID</span>
                                <strong>{order.farmer_id}</strong>
                            </div>

                        </div>

                        <div className="modal-buyer">
                            <span>BUYER</span>

                            <h3>
                                {order.buyer_name || "Unknown"}
                            </h3>

                            <p>
                                📍 {order.buyer_location || "Location not available"}
                            </p>
                        </div>

                        <div className="modal-progress">
                            <div className="progress-title">
                                <span>ORDER TIMELINE</span>
                                <strong>
                                    {getStatusLabel(order.status)}
                                </strong>
                            </div>

                            <div className="modal-status-list">

                                {statuses.map((status, index) => {

                                    const completed =
                                        index <= currentIndex

                                    return (
                                        <div
                                            className={`modal-status-item ${completed
                                                ? "completed"
                                                : ""
                                                }`}
                                            key={status}
                                        >
                                            <div className="modal-status-dot">
                                                {completed ? "✓" : index + 1}
                                            </div>

                                            <span>
                                                {getStatusLabel(status)}
                                            </span>
                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                        <button
                            className="close-details-button"
                            onClick={() => setShowDetails(false)}
                        >
                            Close
                        </button>

                    </div>

                </div>
            )}

        </div>
    )
}

export default OrderCard
