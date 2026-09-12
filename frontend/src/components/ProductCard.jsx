import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createOrder } from "../services/api"

function ProductCard({ product }) {
    const [quantity, setQuantity] = useState(1)
    const isOutOfStock = Number(product.quantity) <= 0
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const user = JSON.parse(localStorage.getItem("user"))
    return (
        <div className="product-card">
            <div className="product-icon">
                🌱
            </div>

            <h2>{product.name}</h2>

            <p className="product-description">
                {product.description || "Fresh agricultural product"}
            </p>

            <p>
                <strong>₹{product.price}</strong> / {product.unit}
            </p>

            <p>
                {isOutOfStock
                    ? "🔴 Out of Stock"
                    : `Available: ${product.quantity} ${product.unit}`
                }
            </p>
            {user?.role === "buyer" && !isOutOfStock && (
                <div className="order-quantity">
                    <label>Quantity:</label>

                    <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />

                    <span>{product.unit}</span>
                </div>
            )}

            <p>
                📍 {product.location}
            </p>

            {user?.role === "buyer" && !isOutOfStock && (
                <button
                    disabled={loading}
                    onClick={async () => {
                        try {
                            setLoading(true)

                            const data = await createOrder({
                                buyer_id: Number(user.user_id),
                                farmer_id: Number(product.farmer_id),
                                product_id: product.id,
                                quantity: quantity
                            })

                            console.log("Order created:", data)

                            navigate("/orders", {
                                state: {
                                    orderPlaced: true
                                }
                            })
                        } catch (error) {
                            console.error("Failed to create order:", error)
                            alert(error.message)
                        } finally {
                            setLoading(false)
                        }
                    }}
                >
                    {loading ? "Placing Order..." : "Buy Product"}
                </button>
            )}

            {user?.role === "farmer" &&
                Number(user?.user_id) === Number(product.farmer_id) && (
                    <button
                        onClick={() =>
                            navigate(`/edit-product/${product.id}`)
                        }
                    >
                        ✏️ Edit Product
                    </button>
                )}
        </div>
    )
}

export default ProductCard