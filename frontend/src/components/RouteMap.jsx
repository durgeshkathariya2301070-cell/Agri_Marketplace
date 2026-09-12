import {
    MapContainer,
    TileLayer,
    Polyline,
    Marker,
    Popup,
    useMap
} from "react-leaflet"

import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"


function FitRoute({ coordinates }) {

    const map = useMap()

    useEffect(() => {

        if (!coordinates || coordinates.length === 0) {
            return
        }

        const bounds = L.latLngBounds(coordinates)

        map.fitBounds(bounds, {
            padding: [40, 40]
        })

    }, [coordinates, map])

    return null
}


function RouteMap({
    pickupCoordinates,
    deliveryCoordinates,
    intermediateCoordinates,
    intermediateLocations,
    roadCoordinates,
    pickupLocation,
    deliveryLocation
}) {

    if (
        !pickupCoordinates ||
        !deliveryCoordinates ||
        !roadCoordinates ||
        roadCoordinates.length === 0
    ) {
        return (
            <div>
                Route map data is not available.
            </div>
        )
    }

    const allCoordinates = [
        pickupCoordinates,
        ...(intermediateCoordinates || []),
        deliveryCoordinates
    ]

    return (
        <div
            style={{
                width: "100%",
                height: "650px",
                borderRadius: "16px",
                overflow: "hidden"
            }}
        >

            <MapContainer
                center={pickupCoordinates}
                zoom={7}
                style={{
                    width: "100%",
                    height: "100%"
                }}
            >

                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitRoute
                    coordinates={roadCoordinates}
                />

                <Polyline
                    positions={roadCoordinates}
                    pathOptions={{
                        weight: 5
                    }}
                />

                <Marker
                    position={pickupCoordinates}
                >
                    <Popup>
                        <strong>Pickup Location</strong>
                        <br />
                        {pickupLocation}
                    </Popup>
                </Marker>


                {(intermediateCoordinates || []).map(
                    (coordinate, index) => (

                        <Marker
                            key={index}
                            position={coordinate}
                        >
                            <Popup>

                                <strong>
                                    Stop {index + 1}
                                </strong>

                                <br />

                                {
                                    intermediateLocations?.[index]
                                    || "Intermediate Location"
                                }

                            </Popup>

                        </Marker>

                    )
                )}


                <Marker
                    position={deliveryCoordinates}
                >
                    <Popup>
                        <strong>
                            Delivery Location
                        </strong>

                        <br />

                        {deliveryLocation}
                    </Popup>
                </Marker>

            </MapContainer>

        </div>
    )
}

export default RouteMap