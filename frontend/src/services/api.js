const API_URL = "https://agri-marketplace-api-pne6.onrender.com"
function getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem("user"))

    if (!user || !user.token) {
        return {}
    }

    return {
        Authorization: `Bearer ${user.token}`
    }
}

export async function getProfile() {
    const response = await fetch(
        `${API_URL}/profile`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {
        throw new Error("Failed to load profile")
    }

    return await response.json()
}

export async function updateProfile(name, phone, location) {
    const params = new URLSearchParams({
        name,
        phone,
        location
    })

    const response = await fetch(
        `${API_URL}/profile?${params.toString()}`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {
        throw new Error("Failed to update profile")
    }

    return await response.json()
}

export async function downloadOrderHistory() {
    const response = await fetch(
        `${API_URL}/orders/history/csv`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {
        throw new Error("Failed to download order history")
    }

    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "order_history.csv"

    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
}

export async function getProducts() {
    const response = await fetch(`${API_URL}/products`, {
        headers: getAuthHeaders()
    })

    if (!response.ok) throw new Error("Failed to fetch products")

    return response.json()
}
export async function getOrders() {
    const response = await fetch(`${API_URL}/orders`, {
        headers: getAuthHeaders()
    })

    if (!response.ok) throw new Error("Failed to fetch orders")

    return response.json()
}

export async function acceptOrder(orderId) {
    const response = await fetch(`${API_URL}/orders/${orderId}/accept`, {
        method: "PUT",
        headers: getAuthHeaders()
    })

    if (!response.ok) {
        throw new Error("Failed to accept order")
    }

    return response.json()
}

export async function rejectOrder(orderId) {
    const response = await fetch(`${API_URL}/orders/${orderId}/reject`, {
        method: "PUT",
        headers: getAuthHeaders()
    })

    if (!response.ok) {
        throw new Error("Failed to reject order")
    }

    return response.json()
}
export async function markOrderInTransit(orderId) {
    const response = await fetch(
        `${API_URL}/orders/${orderId}/in-transit`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to mark order as in transit"
        )
    }

    return data
}

export async function markOrderDelivered(orderId) {
    const response = await fetch(
        `${API_URL}/orders/${orderId}/delivered`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to mark order as delivered"
        )
    }

    return data
}

export async function confirmOrderReceived(orderId) {
    const response = await fetch(
        `${API_URL}/orders/${orderId}/confirm-received`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to confirm order received"
        )
    }

    return data
}
export async function rejectOrderReceived(orderId) {
    const response = await fetch(
        `${API_URL}/orders/${orderId}/not-received`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to report order not received"
        )
    }

    return data
}
export async function markDeliveryInTransit(deliveryId) {
    const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/in-transit`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to start delivery"
        )
    }

    return data
}
export async function markDeliveryDelivered(deliveryId) {
    const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/delivered`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to mark delivery delivered"
        )
    }

    return data
}

export async function markOrderReady(orderId, vehicleCapacity) {
    const response = await fetch(
        `${API_URL}/orders/${orderId}/ready?vehicle_capacity=${vehicleCapacity}`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to mark order as ready")
    }

    return data
}

export async function deleteOrder(orderId) {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    })

    const data = await response.json()

    if (data.error) {
        throw new Error(data.error)
    }

    if (!response.ok) {
        throw new Error("Failed to delete order")
    }

    return data
}

export async function createOrder(orderData) {
    const params = new URLSearchParams({
        buyer_id: orderData.buyer_id,
        farmer_id: orderData.farmer_id,
        product_id: orderData.product_id,
        quantity: orderData.quantity
    })

    const response = await fetch(`${API_URL}/orders?${params}`, {
        method: "POST",
        headers: getAuthHeaders()
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to create order")
    }

    return data
}

export async function getDeliveries() {
    const response = await fetch(`${API_URL}/deliveries`, {
        headers: getAuthHeaders()
    })

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to fetch deliveries")
    }

    return data
}
export async function optimizeDelivery(deliveryId) {
    const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/optimize`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to optimize delivery"
        )
    }

    return data
}
export async function getOptimizedDeliveryRoute(
    deliveryId,
    pickupLocation,
    deliveryLocation
) {
    const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/optimize`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error ||
            "Failed to get optimized delivery route"
        )
    }

    return data
}

export async function getForecasts() {
    const response = await fetch(
        `${API_URL}/forecasts`,
        {
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {
        throw new Error("Failed to fetch forecasts")
    }

    return response.json()
}


export async function generateForecast(
    product,
    location,
    daysAhead
) {
    const response = await fetch(
        `${API_URL}/forecast?product=${encodeURIComponent(product)}&location=${encodeURIComponent(location)}&days_ahead=${daysAhead}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to generate forecast"
        )
    }

    return data
}


export async function registerUser(userData) {
    const params = new URLSearchParams({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone || "",
        location: userData.location || ""
    })

    const response = await fetch(`${API_URL}/register?${params}`, {
        method: "POST"
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || data.message || "Registration failed")
    }

    return data
}

export async function loginUser(email, password) {
    const params = new URLSearchParams({
        email: email,
        password: password
    })

    const response = await fetch(`${API_URL}/login?${params}`, {
        method: "POST"
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || data.message || "Login failed")
    }

    if (data.message !== "Login successful") {
        throw new Error(data.message || "Login failed")
    }

    return data
}


export async function addProduct(productData) {
    const params = new URLSearchParams({
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity,
        unit: productData.unit,
        price: productData.price,
        location: productData.location,
        farmer_id: productData.farmer_id
    })

    const response = await fetch(`${API_URL}/products?${params}`, {
        method: "POST",
        headers: getAuthHeaders()
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.error || data.detail || data.message || "Failed to add product"
        )
    }

    return data
}

export async function updateProduct(productId, productData) {
    const params = new URLSearchParams({
        name: productData.name,
        quantity: productData.quantity,
        unit: productData.unit,
        price: productData.price,
        location: productData.location,
        farmer_id: productData.farmer_id
    })

    const response = await fetch(
        `${API_URL}/products/${productId}?${params}`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.detail || data.message || data.error || "Failed to update product"
        )
    }

    if (data.error) {
        throw new Error(data.error)
    }

    return data
}

export async function updateDeliveryLocation(
    deliveryId,
    latitude,
    longitude
) {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude)
    })

    const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/location?${params}`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to update delivery location"
        )
    }

    return data
}

export async function getDeliveryLocation(deliveryId) {
    const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/location`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(
            data.error || "Failed to get delivery location"
        )
    }

    return data
}
