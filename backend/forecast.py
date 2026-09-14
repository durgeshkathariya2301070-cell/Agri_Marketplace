import pandas as pd
from sklearn.linear_model import LinearRegression

from database import SessionLocal
from models import DemandData, Forecast
from datetime import date, timedelta


def train_demand_model(product="tomato", location="Mumbai"):

    # Normalize user input
    product = product.strip().lower()
    location = location.strip().lower()

    db = SessionLocal()

    data = (
        db.query(DemandData)
        .filter(DemandData.product == product, DemandData.location == location)
        .all()
    )

    mandi_data = [item for item in data if item.source == "mandi"]

    marketplace_data = [item for item in data if item.source == "marketplace"]

    mandi_count = len(mandi_data)
    marketplace_count = len(marketplace_data)

    # Prefer real marketplace history when enough data exists
    if marketplace_count >= 5:
        data = marketplace_data
        forecast_source = "marketplace"

    # Otherwise use historical Mandi data
    elif mandi_count >= 5:
        data = mandi_data
        forecast_source = "mandi"

    # Neither source has enough history
    else:
        db.close()
        raise ValueError(
            f"Not enough historical demand data " f"for {product} in {location}"
        )

    db.close()

    df = pd.DataFrame(
        [{"date": item.date, "quantity_sold": item.quantity_sold} for item in data]
    )

    # Convert date to real datetime
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Remove invalid dates
    df = df.dropna(subset=["date"])

    # Combine all demand recorded on the same date
    df = df.groupby("date", as_index=False)["quantity_sold"].sum()

    # Sort daily demand chronologically
    df = df.sort_values("date").reset_index(drop=True)

    # Number each historical day
    df["day_number"] = range(len(df))

    X = df[["day_number"]]

    y = df["quantity_sold"]

    # Train AI model
    model = LinearRegression()

    model.fit(X, y)

    return (model, len(df), mandi_count, marketplace_count, forecast_source)


def predict_demand(days_ahead=7, product="tomato", location="Mumbai"):
    model, data_count, mandi_count, marketplace_count, forecast_source = (
        train_demand_model(product, location)
    )

    future_day = data_count + days_ahead - 1

    future_data = pd.DataFrame({"day_number": [future_day]})

    prediction = model.predict(future_data)
    
    

    predicted_quantity = float(max(0, round(float(prediction[0]), 3)))

    return (
        predicted_quantity,
        data_count,
        mandi_count,
        marketplace_count,
        forecast_source,
    )


def save_forecast(product, location, forecast_date, predicted_quantity, source):
    db = SessionLocal()

    forecast = Forecast(
        product=product,
        location=location,
        forecast_date=forecast_date,
        predicted_quantity=predicted_quantity,
        source=source
    )

    db.add(forecast)
    db.commit()
    db.refresh(forecast)

    db.close()

    return forecast


if __name__ == "__main__":
    model, data_count, mandi_count, marketplace_count, forecast_source = (
        train_demand_model()
    )
    print("Model trained successfully!")
    print("Historical records used:", data_count)
    print("Mandi records:", mandi_count)
    print("Marketplace records:", marketplace_count)

    (
        predicted_quantity,
        data_count,
        mandi_count,
        marketplace_count,
        forecast_source,
    ) = predict_demand(days_ahead=7)

    print(
        "Predicted historical market quantity after 7 days:",
        predicted_quantity,
        "tonnes",
    )

    forecast_date = date.today() + timedelta(days=7)

    forecast = save_forecast(
        product="tomato",
        location="Mumbai",
        forecast_date=forecast_date,
        predicted_quantity=predicted_quantity,
    )

    print("Forecast saved successfully!")
    print("Forecast ID:", forecast.id)
