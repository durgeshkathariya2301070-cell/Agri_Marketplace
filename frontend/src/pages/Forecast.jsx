import Navbar from "../components/Navbar"
import ForecastCard from "../components/ForecastCard"
import { useEffect, useState } from "react"
import {
    generateForecast,
    getProducts,
    getForecasts
} from "../services/api"

function Forecast() {
    const [forecasts, setForecasts] = useState([])
    const [error, setError] = useState("")

    const [product, setProduct] = useState("")
    const [location, setLocation] = useState("")
    const [daysAhead, setDaysAhead] = useState(7)
    const [generating, setGenerating] = useState(false)

    const [products, setProducts] = useState([])

    useEffect(() => {
        getProducts()
            .then((data) => {
                setProducts(data)


            })
            .catch((err) => {
                console.error("PRODUCT ERROR:", err)
                setError(err.message)
            })
    }, [])

    useEffect(() => {
        getForecasts()
            .then((data) => {
                setForecasts(data)
            })
            .catch((err) => {
                console.error("FORECAST ERROR:", err)
                setError(err.message)
            })
    }, [])

    const handleGenerateForecast = async () => {
        try {
            setGenerating(true)
            setError("")

            const result = await generateForecast(
                product,
                location,
                daysAhead
            )

            setForecasts((currentForecasts) => {
                const newForecast = {
                    id: result.forecast_id,
                    product: result.product,
                    location: result.location,
                    forecast_date: result.forecast_date,
                    predicted_quantity: result.predicted_quantity,
                    total_records: result.total_records,
                    mandi_records: result.mandi_records,
                    marketplace_records: result.marketplace_records,
                    forecast_source: result.forecast_source
                }

                const filteredForecasts = currentForecasts.filter(
                    (forecast) =>
                        !(
                            forecast.product === newForecast.product &&
                            forecast.location === newForecast.location &&
                            forecast.forecast_date === newForecast.forecast_date
                        )
                )

                return [
                    ...filteredForecasts,
                    newForecast
                ]
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="forecast-page">
            <Navbar />

            <main>
                <div className="forecast-page-header">
                    <h1>AI Demand Forecast 🤖</h1>
                    <p>Predict future agricultural demand using AI</p>
                </div>

                <div className="forecast-form">

                    <div className="forecast-field">
                        <label>Product:</label>

                        <input
                            list="product-options"
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                            placeholder="Type product name"
                        />

                        <datalist id="product-options">
                            {products.map((item) => (
                                <option
                                    key={item.id}
                                    value={item.name}
                                />
                            ))}
                        </datalist>
                    </div>

                    <div className="forecast-field">
                        <label>Location:</label>

                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Type location"
                        />
                    </div>

                    <div className="forecast-field">
                        <label>Days Ahead:</label>

                        <input
                            type="number"
                            min="1"
                            value={daysAhead}
                            onChange={(e) =>
                                setDaysAhead(Number(e.target.value))
                            }
                        />
                    </div>

                    <button
                        className="forecast-generate-button"
                        onClick={handleGenerateForecast}
                        disabled={generating}
                    >
                        {generating
                            ? "Generating..."
                            : "🤖 Generate Forecast"}
                    </button>

                </div>

                {error && (
                    <p>{error}</p>
                )}

                {!error && forecasts.length === 0 && (
                    <p>
                        Select a product and generate an AI forecast.
                    </p>
                )}

                {!error && forecasts.length > 0 && (
                    <div className="forecast-list">
                        {[...forecasts]
                            .reverse()
                            .map((forecast) => (
                                <ForecastCard
                                    key={forecast.id}
                                    forecast={forecast}
                                />
                            ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Forecast
