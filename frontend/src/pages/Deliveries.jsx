import Navbar from "../components/Navbar"
import DeliveryCard from "../components/DeliveryCard"
import { useEffect, useState } from "react"
import {
    getDeliveries,
    optimizeDelivery,
    markDeliveryInTransit,
    markDeliveryDelivered
} from "../services/api"

function Deliveries() {
    const [deliveries, setDeliveries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        getDeliveries()
            .then((data) => {

                const deliveriesWithMapData = data.map(
                    (delivery) => {

                        const savedMapData =
                            localStorage.getItem(
                                `delivery-map-${delivery.id}`
                            )

                        if (savedMapData) {
                            return {
                                ...delivery,
                                ...JSON.parse(savedMapData)
                            }
                        }

                        return delivery
                    }
                )

                const sortedDeliveries =
                    [...deliveriesWithMapData].sort(
                        (a, b) => b.id - a.id
                    )

                setDeliveries(sortedDeliveries)
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    const handleOptimize = (deliveryId) => {
        return optimizeDelivery(deliveryId)
            .then((updatedDelivery) => {

                localStorage.setItem(
                    `delivery-map-${deliveryId}`,
                    JSON.stringify(updatedDelivery)
                )

                setDeliveries((currentDeliveries) =>
                    currentDeliveries.map((delivery) =>
                        delivery.id === deliveryId
                            ? {
                                ...delivery,
                                ...updatedDelivery,
                                id: delivery.id,
                                distance: updatedDelivery.total_distance_km,
                                estimated_time: updatedDelivery.estimated_time_min
                            }
                            : delivery
                    )
                )
            })
            .catch((err) => {
                setError(err.message)
            })
    }

    const handleMarkInTransit = (deliveryId) => {
        return markDeliveryInTransit(deliveryId)
            .then((updatedDelivery) => {
                setDeliveries((currentDeliveries) =>
                    currentDeliveries.map((delivery) =>
                        delivery.id === deliveryId
                            ? {
                                ...delivery,
                                ...updatedDelivery
                            }
                            : delivery
                    )
                )
            })
            .catch((err) => {
                setError(err.message)
            })
    }

    const handleMarkDelivered = (deliveryId) => {
        return markDeliveryDelivered(deliveryId)
            .then((updatedDelivery) => {
                setDeliveries((currentDeliveries) =>
                    currentDeliveries.map((delivery) =>
                        delivery.id === deliveryId
                            ? {
                                ...delivery,
                                ...updatedDelivery
                            }
                            : delivery
                    )
                )
            })
            .catch((err) => {
                setError(err.message)
            })
    }

    return (
        <div>
            <Navbar />

            <main>
                <h1>Deliveries 🚚</h1>
                <p>Track and manage agricultural deliveries</p>

                {loading && (
                    <p>Loading deliveries...</p>
                )}

                {error && (
                    <p>{error}</p>
                )}

                {!loading && !error && deliveries.length === 0 && (
                    <p>No deliveries available.</p>
                )}

                {!loading && !error && deliveries.length > 0 && (
                    <div className="deliveries-grid">
                        {deliveries.map((delivery) => (
                            <DeliveryCard
                                key={delivery.id}
                                delivery={delivery}
                                onOptimize={handleOptimize}
                                onMarkInTransit={handleMarkInTransit}
                                onMarkDelivered={handleMarkDelivered}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Deliveries
