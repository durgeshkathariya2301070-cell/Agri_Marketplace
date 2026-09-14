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
const farmerIcon = L.divIcon({
    className: "farmer-location-icon",
    html: "🚚",
    iconSize: [80, 80],
    iconAnchor: [40, 40]
})


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
    deliveryLocation,
    currentLatitude,
    currentLongitude
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

    const currentFarmerCoordinates =
        currentLatitude !== null &&
            currentLatitude !== undefined &&
            currentLongitude !== null &&
            currentLongitude !== undefined
            ? [
                Number(currentLatitude),
                Number(currentLongitude)
            ]
            : null

    console.log(
        "FARMER MARKER COORDINATES:",
        currentFarmerCoordinates
    )

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
                    coordinates={
                        currentFarmerCoordinates
                            ? [
                                ...roadCoordinates,
                                currentFarmerCoordinates
                            ]
                            : roadCoordinates
                    }
                />

                <Polyline
                    positions={roadCoordinates}
                    pathOptions={{
                        weight: 5
                    }}
                />

                {currentFarmerCoordinates && (
                    <Marker
                        position={currentFarmerCoordinates}
                        icon={farmerIcon}
                        zIndexOffset={2000}
                    >
                        <Popup>
                            <strong>
                                🚚 Farmer Current Location
                            </strong>
                            <br />
                            Delivery vehicle is currently here.
                            <br />
                            Latitude: {currentFarmerCoordinates[0]}
                            <br />
                            Longitude: {currentFarmerCoordinates[1]}
                        </Popup>
                    </Marker>
                )}
                <Marker
                    position={pickupCoordinates}
                >
                    <Popup>
                        <strong>
                            Pickup Location
                        </strong>

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