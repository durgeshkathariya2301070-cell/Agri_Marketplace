function ForecastCard({ forecast }) {
    return (
        <div className="forecast-card">
            <h2>{forecast.product}</h2>

            <p>
                📍 Location: {forecast.location}
            </p>

            <p>
                📅 Forecast Date: {forecast.forecast_date}
            </p>

            <div className="forecast-source">
                <p>
                    📊 Mandi Records: {forecast.mandi_records}
                </p>

                <p>
                    🛒 Marketplace Orders: {forecast.marketplace_records}
                </p>

                <p>
                    📚 Total Training Records: {forecast.total_records}
                </p>
            </div>

            <p>
                🤖 Predicted Demand:
            </p>

            <strong>
                {forecast.predicted_quantity} tonnes
            </strong>
            <p className="forecast-source-text">
                {forecast.forecast_source === "marketplace"
                    ? "Forecast basis: Real marketplace delivered orders"
                    : "Forecast basis: Historical Mandi Market Data"}
            </p>
        </div>
    )
}

export default ForecastCard