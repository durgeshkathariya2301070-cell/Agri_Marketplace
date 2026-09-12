import Navbar from "../components/Navbar"
import RouteMap from "../components/RouteMap"
import { useLocation, useNavigate } from "react-router-dom"


function RouteMapPage() {

    const location = useLocation()
    const navigate = useNavigate()

    const delivery = location.state?.delivery

    if (!delivery) {
        return (
            <div>
                <Navbar />

                <main>
                    <h1>Route Map</h1>

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
                />

            </main>

        </div>
    )
}

export default RouteMapPage