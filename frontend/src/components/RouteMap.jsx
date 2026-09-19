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

    console.log("ROUTE MAP ALL PROPS:", {
        pickupCoordinates,
        deliveryCoordinates,
        roadCoordinates,
        intermediateCoordinates,
        currentLatitude,
        currentLongitude
    })

    console.log("FARMER MAP DATA:", {
        pickupCoordinates,
        deliveryCoordinates,
        roadCoordinatesLength: roadCoordinates?.length,
        currentLatitude,
        currentLongitude
    })

    console.log(
        "FARMER ROAD COORDINATES VALUE:",
        roadCoordinates
    )

    console.log(
        "FARMER ROAD COORDINATES TYPE:",
        typeof roadCoordinates,
        Array.isArray(roadCoordinates)
    )

    console.log("MAP DATA VALIDATION:", {
        hasPickup: Boolean(pickupCoordinates),
        hasDelivery: Boolean(deliveryCoordinates),
        hasRoad: Boolean(roadCoordinates),
        roadLength: roadCoordinates?.length
    })
    const safeRoadCoordinates = Array.isArray(roadCoordinates)
        ? roadCoordinates
        : []

    console.log(
        "ROAD COORDINATES FIRST 3:",
        safeRoadCoordinates.slice(0, 3)
    )

    console.log(
        "ROAD COORDINATES LAST 3:",
        safeRoadCoordinates.slice(-3)
    )

    const allCoordinates = [
        pickupCoordinates,
        ...(intermediateCoordinates || []),
        deliveryCoordinates
    ]

    const isValidCoordinate = (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        Number.isFinite(Number(coordinate[0])) &&
        Number.isFinite(Number(coordinate[1]))

    const safePickupCoordinates =
        isValidCoordinate(pickupCoordinates)
            ? pickupCoordinates
            : null

    const safeDeliveryCoordinates =
        isValidCoordinate(deliveryCoordinates)
            ? deliveryCoordinates
            : null

    const safeIntermediateCoordinates =
        (intermediateCoordinates || []).filter(
            isValidCoordinate
        )

    console.log("FARMER PICKUP:", pickupCoordinates)
    console.log("FARMER DELIVERY:", deliveryCoordinates)
    console.log(
        "FARMER INTERMEDIATE:",
        intermediateCoordinates
    )

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
                    height: "650px",
                    minHeight: "650px"
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
                                ...safeRoadCoordinates,
                                currentFarmerCoordinates
                            ]
                            : safeRoadCoordinates
                    }
                />

                <Polyline
                    positions={safeRoadCoordinates}
                    pathOptions={{ weight: 5 }}
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
                {safePickupCoordinates && (
                    <Marker
                        position={safePickupCoordinates}
                    >
                        <Popup>
                            <strong>
                                Pickup Location
                            </strong>

                            <br />

                            {pickupLocation}
                        </Popup>
                    </Marker>
                )}


                {safeIntermediateCoordinates.map(
                    (coordinate, index) => {
                        console.log(
                            "FARMER INTERMEDIATE MARKER:",
                            index,
                            coordinate
                        )

                        return (
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
                    }
                )}
                {safeDeliveryCoordinates && (
                    <Marker
                        position={safeDeliveryCoordinates}
                    >
                        <Popup>
                            <strong>
                                Delivery Location
                            </strong>

                            <br />

                            {deliveryLocation}
                        </Popup>
                    </Marker>
                )}


            </MapContainer>

        </div>
    )
}

export default RouteMap