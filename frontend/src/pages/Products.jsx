import Navbar from "../components/Navbar"
import ProductCard from "../components/ProductCard"
import { useEffect, useState } from "react"
import { getProducts } from "../services/api"

function Products() {
    const user = JSON.parse(localStorage.getItem("user"))
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [locationFilter, setLocationFilter] = useState("")


    useEffect(() => {
        getProducts()
            .then((data) => {
                setProducts(data)
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    return (
        <div>
            <Navbar />

            <main>
                <div className="products-header">
                    <div>
                        <h1>Marketplace 🛒</h1>
                        <p>Browse fresh agricultural products</p>
                    </div>

                    {user?.role === "farmer" && (
                        <button
                            className="add-product-button"
                            onClick={() => window.location.href = "/add-product"}
                        >
                            + Add Product
                        </button>
                    )}
                </div>

                <div className="product-filters">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    >
                        <option value="">All Locations</option>

                        {[...new Set(products.map((product) => product.location))]
                            .filter(Boolean)
                            .map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <h2>Available Products</h2>

                    {loading && (
                        <p>Loading products...</p>
                    )}

                    {error && (
                        <p>{error}</p>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <p>No products available.</p>
                    )}

                    {!loading && !error && products.length > 0 && (
                        <div className="product-grid">
                            {products
                                .filter((product) =>
                                    product.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                                )
                                .filter((product) =>
                                    locationFilter === "" || product.location === locationFilter
                                )
                                .map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Products