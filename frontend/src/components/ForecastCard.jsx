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

            <p>
                Predicted Demand:
            </p>

            <strong>
                {forecast.predicted_quantity} tonnes
            </strong>
        </div>
    )
}

export default ForecastCard
