const API_URL = "http://127.0.0.1:8000"
function getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem("user"))

    if (!user || !user.token) {
        return {}
    }

    return {
        Authorization: `Bearer ${user.token}`
    }
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
        method: "PUT"
    })

    if (!response.ok) {
        throw new Error("Failed to accept order")
    }

    return response.json()
}

export async function rejectOrder(orderId) {
    const response = await fetch(`${API_URL}/orders/${orderId}/reject`, {
        method: "PUT"
    })

    if (!response.ok) {
        throw new Error("Failed to reject order")
    }

    return response.json()
}


export async function markOrderInTransit(orderId) {
    const response = await fetch(
        `http://127.0.0.1:8000/orders/${orderId}/in-transit`,
        {
            method: "PUT",
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
            method: "PUT"
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

export async function markDeliveryInTransit(deliveryId) {
    const response = await fetch(
        `http://127.0.0.1:8000/deliveries/${deliveryId}/in-transit`,
        {
            method: "PUT"
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to mark delivery in transit")
    }

    return data
}

export async function markDeliveryDelivered(deliveryId) {
    const response = await fetch(
        `http://127.0.0.1:8000/deliveries/${deliveryId}/delivered`,
        {
            method: "PUT"
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to mark delivery as delivered")
    }

    return data
}

export async function markOrderReady(orderId, vehicleCapacity) {
    const response = await fetch(
        `http://127.0.0.1:8000/orders/${orderId}/ready?vehicle_capacity=${vehicleCapacity}`,
        {
            method: "PUT"
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
        method: "POST"
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to create order")
    }

    return data
}

export async function getDeliveries() {
    const response = await fetch(`${API_URL}/deliveries`)

    if (!response.ok) {
        throw new Error("Failed to fetch deliveries")
    }

    return response.json()
}

export async function optimizeDelivery(deliveryId) {
    const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/optimize`,
        {
            method: "PUT"
        }
    )

    if (!response.ok) {
        throw new Error("Failed to optimize delivery")
    }

    return response.json()
}

export async function getForecasts() {
    const response = await fetch(`${API_URL}/forecasts`)

    if (!response.ok) {
        throw new Error("Failed to fetch forecasts")
    }

    return response.json()
}

export async function generateForecast(product, location, daysAhead) {
    const response = await fetch(
        `${API_URL}/forecast?product=${encodeURIComponent(product)}&location=${encodeURIComponent(location)}&days_ahead=${daysAhead}`,
        {
            method: "POST"
        }
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate forecast")
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
        method: "POST"
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to add product")
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
            method: "PUT"
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
