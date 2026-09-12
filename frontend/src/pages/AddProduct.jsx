import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addProduct } from "../services/api"
function AddProduct() {

    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [quantity, setQuantity] = useState("")
    const [unit, setUnit] = useState("kg")
    const [price, setPrice] = useState("")
    const [location, setLocation] = useState("")

    return (
        <div className="add-product-page">
            <div className="add-product-card">

                <h1>🌱 Agri Marketplace</h1>
                <h2>Add New Product</h2>

                <form
                    className="add-product-form"
                    onSubmit={async (e) => {
                        e.preventDefault()

                        try {
                            const data = await addProduct({
                                name,
                                description,
                                quantity: Number(quantity),
                                unit,
                                price: Number(price),
                                location,
                                farmer_id: user.user_id
                            })

                            console.log("Product added:", data)
                            navigate("/products")

                        } catch (error) {
                            alert(error.message)
                            console.error("Failed to add product:", error)
                        }
                    }}
                >
                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Tomato"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your product"
                        />
                    </div>

                    <div className="form-group">
                        <label>Quantity</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g. 500"
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
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g. 25"
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Nashik"
                        />
                    </div>

                    <button type="submit">
                        Add Product
                    </button>

                </form>

            </div>
        </div>
    )
}

export default AddProduct