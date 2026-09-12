import { useState } from "react"
import { useNavigate } from "react-router-dom"

function DeliveryCard({
    delivery,
    onOptimize,
    onMarkInTransit,
    onMarkDelivered
}) {
    const navigate = useNavigate()
    const [optimizing, setOptimizing] = useState(false)

    const handleOptimize = async () => {
        try {
            setOptimizing(true)
            await onOptimize(delivery.id)
        } finally {
            setOptimizing(false)
        }
    }

    const getCurrentStep = () => {
        if (delivery.status === "delivered") return 3
        if (delivery.status === "in_transit") return 2
        if (delivery.route) return 1
        return 0
    }

    const currentStep = getCurrentStep()

    const steps = [
        "Pending",
        "Route Optimized",
        "In Transit",
        "Delivered"
    ]

    return (
        <div className="delivery-card">

            <div className="delivery-card-header">
                <div>
                    <span className="delivery-label">
                        DELIVERY
                    </span>

                    <h2>#{delivery.id}</h2>
                </div>

                <span
                    className={`delivery-status delivery-${delivery.status}`}
                >
                    {delivery.status === "in_transit"
                        ? "In Transit"
                        : delivery.status.replace("_", " ")}
                </span>
            </div>

            <div className="delivery-route-box">
                <span className="delivery-info-label">
                    ROUTE
                </span>

                <p>
                    📍 {delivery.pickup_location}
                    {" → "}
                    {delivery.delivery_location}
                </p>

                <small>
                    Order #{delivery.order_id}
                </small>
            </div>

            <div className="delivery-info-grid">

                <div>
                    <span>Distance</span>
                    <strong>
                        {delivery.distance || "--"} km
                    </strong>
                </div>

                <div>
                    <span>Estimated Time</span>
                    <strong>
                        {delivery.estimated_time
                            ? `${delivery.estimated_time} min`
                            : "--"}
                    </strong>
                </div>

                <div>
                    <span>Vehicle Capacity</span>
                    <strong>
                        {delivery.vehicle_capacity}
                    </strong>
                </div>

                <div>
                    <span>Order ID</span>
                    <strong>
                        #{delivery.order_id}
                    </strong>
                </div>

            </div>

            {delivery.route && delivery.status !== "delivered" && (
                <div className="optimized-route">
                    <span>OPTIMIZED ROUTE</span>
                    <p>{delivery.route}</p>
                </div>
            )}

            <div className="delivery-progress">

                <div className="delivery-progress-title">
                    <span>DELIVERY PROGRESS</span>

                    <strong>
                        {steps[currentStep]}
                    </strong>
                </div>

                <div className="delivery-progress-track">

                    {steps.map((step, index) => {

                        const completed = index <= currentStep

                        return (
                            <div
                                className={`delivery-step ${
                                    completed ? "completed" : ""
                                }`}
                                key={step}
                            >

                                <div className="delivery-dot">
                                    {completed
                                        ? "✓"
                                        : index + 1}
                                </div>

                                <span>{step}</span>

                            </div>
                        )
                    })}

                </div>
            </div>

            <div className="delivery-actions">

                {delivery.status === "ready" && !delivery.route && (
                    <button
                        onClick={handleOptimize}
                        disabled={optimizing}
                    >
                        {optimizing
                            ? "Optimizing..."
                            : "🚚 Optimize Route"}
                    </button>
                )}

                {delivery.status === "in_transit" && (
                    <button
                        onClick={() =>
                            onMarkDelivered(delivery.id)
                        }
                    >
                        ✅ Mark Delivered
                    </button>
                )}

                {delivery.status === "delivered" && (
                    <div className="delivery-completed">
                        ✅ Delivery Completed
                    </div>
                )}

                {delivery.route &&
                    delivery.road_coordinates &&
                    delivery.road_coordinates.length > 0 && (
                        <button
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
                            🗺️ View Route on Map
                        </button>
                    )}

            </div>

        </div>
    )
}

export default DeliveryCard
