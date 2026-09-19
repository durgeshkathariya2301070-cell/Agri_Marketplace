import Navbar from "../components/Navbar"
import RouteMap from "../components/RouteMap"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import {
    getDeliveryLocation,
    getDeliveries,
    getOptimizedDeliveryRoute
} from "../services/api"


function RouteMapPage() {

    const location = useLocation()
    const navigate = useNavigate()
    const { deliveryId } = useParams()

    const [delivery, setDelivery] = useState(
        location.state?.delivery || null
    )

    console.log(
        "ROUTE MAP PAGE INITIAL DELIVERY:",
        location.state?.delivery
    )



    const [routeLoading, setRouteLoading] = useState(false)

    const [loading, setLoading] = useState(
        !location.state?.delivery
    )

    const [currentLatitude, setCurrentLatitude] = useState(
        location.state?.delivery?.current_latitude ?? null
    )

    const [currentLongitude, setCurrentLongitude] = useState(
        location.state?.delivery?.current_longitude ?? null
    )

    useEffect(() => {
        const fetchDelivery = async () => {
            try {
                const deliveries = await getDeliveries()

                const foundDelivery = deliveries.find(
                    (item) =>
                        Number(item.id) === Number(deliveryId)
                )

                if (!foundDelivery) {
                    return
                }

                console.log(
                    "FOUND DELIVERY:",
                    foundDelivery
                )

                let finalDelivery = foundDelivery

                try {
                    setRouteLoading(true)

                    const routeData =
                        await getOptimizedDeliveryRoute(
                            foundDelivery.id,
                            foundDelivery.pickup_location,
                            foundDelivery.delivery_location
                        )

                    console.log(
                        "ROUTE DATA FROM BACKEND:",
                        routeData
                    )

                    finalDelivery = {
                        ...foundDelivery,
                        route: routeData.route,
                        distance:
                            routeData.total_distance_km,
                        estimated_time:
                            routeData.estimated_time_min,
                        pickup_coordinates:
                            routeData.pickup_coordinates,
                        delivery_coordinates:
                            routeData.delivery_coordinates,
                        intermediate_locations:
                            routeData.intermediate_locations,
                        intermediate_coordinates:
                            routeData.intermediate_coordinates,
                        road_coordinates:
                            routeData.road_coordinates
                    }

                    console.log(
                        "FINAL DELIVERY WITH ROUTE:",
                        finalDelivery
                    )
                } catch (error) {
                    console.error(
                        "Failed to optimize route:",
                        error
                    )
                } finally {
                    setRouteLoading(false)
                }

                setDelivery(finalDelivery)

                setCurrentLatitude(
                    finalDelivery.current_latitude ?? null
                )

                setCurrentLongitude(
                    finalDelivery.current_longitude ?? null
                )
            } catch (error) {
                console.error(
                    "Failed to fetch delivery:",
                    error
                )
            } finally {
                setLoading(false)
            }
        }

        if (deliveryId) {
            fetchDelivery()
        } else {
            setLoading(false)
        }
    }, [deliveryId])

    


    useEffect(() => {

        if (!delivery?.id) {
            return
        }

        const fetchCurrentLocation = async () => {

            try {

                const data = await getDeliveryLocation(
                    delivery.id
                )
                console.log("BUYER TRACKING LOCATION:", data)



                if (
                    data.latitude !== null &&
                    data.latitude !== undefined
                ) {
                    setCurrentLatitude(
                        Number(data.latitude)
                    )
                }

                if (
                    data.longitude !== null &&
                    data.longitude !== undefined
                ) {
                    setCurrentLongitude(
                        Number(data.longitude)
                    )
                }

            } catch (error) {

                console.error(
                    "Failed to get delivery location:",
                    error
                )

            }
        }

        fetchCurrentLocation()

        const interval = setInterval(
            fetchCurrentLocation,
            5000
        )

        return () => clearInterval(interval)

    }, [delivery?.id])


    if (loading || routeLoading) {

        return (
            <div>

                <Navbar />

                <main>

                    <h1>
                        Delivery Route 🗺️
                    </h1>

                    <p>
                        {loading
                            ? "Loading delivery information..."
                            : "Loading optimized route..."}
                    </p>

                </main>

            </div>
        )
    }

    console.log(
        "ROUTE MAP GPS PROPS:",
        currentLatitude,
        currentLongitude
    )


    if (!delivery) {

        return (
            <div>

                <Navbar />

                <main>

                    <h1>
                        Route Map
                    </h1>

                    <p>
                        Route information is not available.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/deliveries")
                        }
                    >
                        ← Back to Deliveries
                    </button>

                </main>

            </div>
        )
    }

    console.log(
        "ROUTE MAP GPS PROPS:",
        currentLatitude,
        currentLongitude
    )
    return (
        <div>

            <Navbar />

            <main>

                <button
                    onClick={() =>
                        navigate("/deliveries")
                    }
                >
                    ← Back to Deliveries
                </button>

                <h1>
                    Delivery Route 🗺️
                </h1>

                <p>
                    Delivery #{delivery.id}
                </p>

                <div className="route-summary">

                    <h2>
                        {delivery.route}
                    </h2>

                    <p>
                        📏 Distance:{" "}
                        {delivery.distance} km
                    </p>

                    <p>
                        ⏱️ Estimated Time:{" "}
                        {delivery.estimated_time} min
                    </p>

                </div>

                {/* console.log(
                "ROUTE MAP CURRENT GPS:",
                currentLatitude,
                currentLongitude
                ) */}

                <RouteMap
                    pickupCoordinates={
                        delivery.pickup_coordinates
                    }

                    deliveryCoordinates={
                        delivery.delivery_coordinates
                    }

                    intermediateCoordinates={
                        delivery.intermediate_coordinates
                    }

                    intermediateLocations={
                        delivery.intermediate_locations
                    }

                    roadCoordinates={
                        delivery.road_coordinates
                    }

                    pickupLocation={
                        delivery.pickup_location
                    }

                    deliveryLocation={
                        delivery.delivery_location
                    }

                    currentLatitude={
                        currentLatitude
                    }

                    currentLongitude={
                        currentLongitude
                    }
                />

            </main>

        </div>
    )
}


export default RouteMapPage