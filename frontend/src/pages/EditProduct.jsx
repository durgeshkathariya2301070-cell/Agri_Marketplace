import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getProducts, updateProduct } from "../services/api"

function EditProduct() {
    const { productId } = useParams()
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [quantity, setQuantity] = useState("")
    const [unit, setUnit] = useState("kg")
    const [price, setPrice] = useState("")
    const [location, setLocation] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProducts()
            .then((products) => {
                const product = products.find(
                    (item) => item.id === Number(productId)
                )

                if (!product) {
                    alert("Product not found")
                    navigate("/products")
                    return
                }

                setName(product.name)
                setQuantity(product.quantity)
                setUnit(product.unit)
                setPrice(product.price)
                setLocation(product.location)

                setLoading(false)
            })
            .catch((error) => {
                alert(error.message)
                navigate("/products")
            })
    }, [productId, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const user = JSON.parse(localStorage.getItem("user"))

        try {
            const data = await updateProduct(productId, {
                name,
                quantity: Number(quantity),
                unit,
                price: Number(price),
                location,
                farmer_id: user.user_id
            })

            console.log("Product updated:", data)

            navigate("/products")
        } catch (error) {
            console.error("Failed to update product:", error)
            alert(error.message)
        }
    }

    if (loading) {
        return <p>Loading product...</p>
    }

    return (
        <div className="add-product-page">
            <div className="add-product-card">

                <h1>🌱 Agri Marketplace</h1>
                <h2>Edit Product</h2>

                <form
                    className="add-product-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Quantity</label>
                        <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Unit</label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            <option value="kg">kg</option>
                            <option value="quintal">Quintal</option>
                            <option value="ton">Ton</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Price per unit</label>
                        <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">
                        Save Changes
                    </button>

                </form>

            </div>
        </div>
    )
}

export default EditProduct