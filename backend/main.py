from fastapi import FastAPI, Header, Depends
from fastapi.responses import JSONResponse
from database import engine, Base, SessionLocal
import models
from fastapi.middleware.cors import CORSMiddleware
from models import Forecast
from forecast import predict_demand, save_forecast
from datetime import date, timedelta
import json
from urllib.parse import quote
from urllib.request import Request, urlopen

app = FastAPI()
TOKENS = {}


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return None

    if not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "", 1)

    user_id = TOKENS.get(token)

    if not user_id:
        return None

    db = SessionLocal()

    user = db.query(models.User).filter(models.User.id == user_id).first()

    db.close()

    return user


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_ORDER_STATUSES = [
    "pending",
    "accepted",
    "rejected",
    "ready",
    "in_transit",
    "delivered",
]

from sqlalchemy import text

Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    conn.execute(
        text(
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_by_buyer BOOLEAN DEFAULT FALSE;"
        )
    )
    conn.execute(
        text(
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_by_farmer BOOLEAN DEFAULT FALSE;"
        )
    )
    conn.commit()


@app.get("/")
def home():
    return {"message": "Agri Marketplace API is running"}


@app.post("/products")
def add_product(
    name: str,
    quantity: int,
    unit: str,
    price: int,
    location: str,
    farmer_id: int,
    description: str = "",
):
    db = SessionLocal()

    product = models.Product(
        name=name,
        description=description,
        quantity=quantity,
        unit=unit,
        price=price,
        location=location,
        farmer_id=farmer_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    db.close()

    return {"message": "Product added successfully", "product_id": product.id}


@app.get("/products")
def get_products(authorization: str = Header(None)):
    current_user = get_current_user(authorization)

    if not current_user:
        return JSONResponse(
            status_code=401, content={"error": "Authentication required"}
        )

    db = SessionLocal()

    products = db.query(models.Product).all()

    db.close()

    return products


@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    name: str,
    quantity: int,
    unit: str,
    price: int,
    location: str,
    farmer_id: int,
):
    db = SessionLocal()

    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        db.close()
        return {"error": "Product not found"}

    if product.farmer_id != farmer_id:
        db.close()
        return {"error": "You can only edit your own products"}

    if quantity < 0:
        db.close()
        return {"error": "Quantity cannot be negative"}

    if price < 0:
        db.close()
        return {"error": "Price cannot be negative"}

    product.name = name
    product.quantity = quantity
    product.unit = unit
    product.price = price
    product.location = location

    db.commit()
    db.refresh(product)
    db.close()

    return {"message": "Product updated successfully", "product_id": product.id}


@app.post("/orders")
def create_order(buyer_id: int, farmer_id: int, product_id: int, quantity: int):
    db = SessionLocal()

    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        db.close()
        return {"error": "Product not found"}

    if quantity <= 0:
        db.close()
        return {"error": "Quantity must be greater than 0"}

    if quantity > product.quantity:
        db.close()
        return {"error": "Not enough inventory", "available_quantity": product.quantity}

    total_price = quantity * product.price

    order = models.Order(
        buyer_id=buyer_id,
        farmer_id=farmer_id,
        product_id=product_id,
        quantity=quantity,
        total_price=total_price,
        status="pending",
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order created successfully",
        "order_id": order.id,
        "total_price": total_price,
    }


@app.get("/orders")
def get_orders(authorization: str = Header(None)):
    current_user = get_current_user(authorization)

    if not current_user:
        return JSONResponse(
            status_code=401, content={"error": "Authentication required"}
        )

    db = SessionLocal()
    orders = db.query(models.Order).all()

    result = []

    for order in orders:
        product = (
            db.query(models.Product)
            .filter(models.Product.id == order.product_id)
            .first()
        )

        result.append(
            {
                "id": order.id,
                "buyer_id": order.buyer_id,
                "buyer_name": order.buyer.name if order.buyer else "Unknown",
                "buyer_location": order.buyer.location if order.buyer else "Unknown",
                "farmer_id": order.farmer_id,
                "product_id": order.product_id,
                "product_name": product.name if product else "Unknown Product",
                "quantity": order.quantity,
                "total_price": order.total_price,
                "status": order.status,
                "deleted_by_buyer": order.deleted_by_buyer or False,
                "deleted_by_farmer": order.deleted_by_farmer or False,
            }
        )

    db.close()

    return result


@app.put("/orders/{order_id}/status")
def update_order_status(order_id: int, status: str):
    db = SessionLocal()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if status not in ALLOWED_ORDER_STATUSES:
        db.close()
        return {"error": "Invalid status", "allowed_statuses": ALLOWED_ORDER_STATUSES}

    order.status = status

    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status,
    }


@app.put("/orders/{order_id}/accept")
def accept_order(order_id: int):
    db = SessionLocal()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "pending":
        db.close()
        return {
            "error": "Only pending orders can be accepted",
            "current_status": order.status,
        }

    product = (
        db.query(models.Product).filter(models.Product.id == order.product_id).first()
    )

    if not product:
        db.close()
        return {"error": "Product not found"}

    if order.quantity > product.quantity:
        db.close()
        return {"error": "Not enough inventory", "available_quantity": product.quantity}

    product.quantity = product.quantity - order.quantity

    order.status = "accepted"

    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order accepted successfully",
        "order_id": order.id,
        "status": order.status,
    }


@app.put("/orders/{order_id}/ready")
def mark_order_ready(order_id: int, vehicle_capacity: int):
    db = SessionLocal()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "accepted":
        db.close()
        return {"error": "Only accepted orders can be marked as ready"}

    product = (
        db.query(models.Product).filter(models.Product.id == order.product_id).first()
    )

    if not product:
        db.close()
        return {"error": "Product not found"}

    existing_delivery = (
        db.query(models.Delivery).filter(models.Delivery.order_id == order.id).first()
    )

    if existing_delivery:
        db.close()
        return {"error": "Delivery already exists for this order"}

    order.status = "ready"

    delivery = models.Delivery(
        order_id=order.id,
        pickup_location=product.location,
        delivery_location=order.buyer.location,
        vehicle_capacity=vehicle_capacity,
        status="ready",
    )

    db.add(delivery)
    db.commit()

    db.refresh(order)
    db.refresh(delivery)

    db.close()

    return {
        "message": "Order marked as ready and delivery created",
        "order_id": order.id,
        "status": order.status,
        "delivery_id": delivery.id,
    }

@app.put("/orders/{order_id}/in-transit")
def mark_order_in_transit(order_id: int):

    db = SessionLocal()

    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .first()
    )

    if not order:
        db.close()
        return {
            "error": "Order not found"
        }

    if order.status != "ready":
        db.close()
        return {
            "error": "Only ready orders can be marked as in transit"
        }

    order.status = "in_transit"

    if order.delivery:
        order.delivery.status = "in_transit"

    db.commit()

    db.refresh(order)

    delivery_id = (
        order.delivery.id
        if order.delivery
        else None
    )

    delivery_status = (
        order.delivery.status
        if order.delivery
        else None
    )

    db.close()

    return {
        "message": "Order marked as in transit",
        "order_id": order.id,
        "status": order.status,
        "delivery_id": delivery_id,
        "delivery_status": delivery_status
    }

@app.put("/orders/{order_id}/delivered")
def mark_order_delivered(order_id: int):
    db = SessionLocal()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "in_transit":
        db.close()
        return {"error": "Only orders in transit can be marked as delivered"}

    order.status = "delivered"
    if order.delivery:
        order.delivery.status = "delivered"

    db.commit()
    db.refresh(order)

    db.close()

    return {
        "message": "Order marked as delivered",
        "order_id": order.id,
        "status": order.status,
    }


@app.delete("/orders/{order_id}")
def delete_order(order_id: int, authorization: str = Header(None)):
    current_user = get_current_user(authorization)

    if not current_user:
        return JSONResponse(
            status_code=401, content={"error": "Authentication required"}
        )

    db = SessionLocal()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status not in ["delivered", "rejected"]:
        db.close()
        return {
            "error": "Only delivered or rejected orders can be deleted",
            "current_status": order.status,
        }

    # Hide for the specific user who deleted it
    if current_user.id == order.farmer_id:
        order.deleted_by_farmer = True
    elif current_user.id == order.buyer_id:
        order.deleted_by_buyer = True
    else:
        db.close()
        return {"error": "You do not have permission to delete this order"}

    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order removed from your history successfully",
        "order_id": order_id,
    }


@app.put("/orders/{order_id}/reject")
def reject_order(order_id: int):
    db = SessionLocal()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "pending":
        db.close()
        return {
            "error": "Only pending orders can be rejected",
            "current_status": order.status,
        }

    order.status = "rejected"

    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order rejected successfully",
        "order_id": order.id,
        "status": order.status,
    }


@app.post("/deliveries")
def create_delivery(order_id: int, vehicle_capacity: int):
    db = SessionLocal()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "accepted":
        db.close()
        return {
            "error": "Delivery can only be created for accepted orders",
            "current_status": order.status,
        }

    product = (
        db.query(models.Product).filter(models.Product.id == order.product_id).first()
    )

    if not product:
        db.close()
        return {"error": "Product not found"}

    delivery = models.Delivery(
        order_id=order.id,
        pickup_location=product.location,
        delivery_location=order.buyer.location,
        vehicle_capacity=vehicle_capacity,
        status="pending",
    )

    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    db.close()

    return {
        "message": "Delivery created successfully",
        "delivery_id": delivery.id,
        "pickup_location": delivery.pickup_location,
        "delivery_location": delivery.delivery_location,
        "status": delivery.status,
    }


@app.get("/deliveries")
def get_deliveries():
    db = SessionLocal()

    deliveries = db.query(models.Delivery).all()

    db.close()

    return deliveries


def geocode_location(location):
    """
    Convert a city/place name into latitude and longitude.
    """

    url = (
        "https://nominatim.openstreetmap.org/search"
        f"?q={quote(location, safe='')}"
        "&format=json"
        "&limit=1"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "SmartAgriMarketplace/1.0"
        }
    )

    with urlopen(request, timeout=10) as response:
        data = json.loads(
            response.read().decode("utf-8")
        )

    if not data:
        return None

    return {
        "latitude": float(data[0]["lat"]),
        "longitude": float(data[0]["lon"])
    }


def reverse_geocode_location(
    longitude,
    latitude
):
    url = (
        "https://nominatim.openstreetmap.org/reverse"
        f"?lat={latitude}"
        f"&lon={longitude}"
        "&format=json"
        "&zoom=10"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "SmartAgriMarketplace/1.0"
        }
    )

    with urlopen(request, timeout=15) as response:
        data = json.loads(
            response.read().decode("utf-8")
        )

    address = data.get("address", {})

    return (
        address.get("city")
        or address.get("town")
        or address.get("municipality")
        or address.get("village")
        or address.get("county")
        or "Unknown place"
    )


def calculate_real_route(
    pickup_location,
    delivery_location
):
    """
    Get real road distance and travel time
    between pickup and delivery locations.
    """

    pickup = geocode_location(
        pickup_location
    )

    destination = geocode_location(
        delivery_location
    )

    if not pickup:
        return {
            "error": (
                f"Pickup location not found: "
                f"{pickup_location}"
            )
        }

    if not destination:
        return {
            "error": (
                f"Delivery location not found: "
                f"{delivery_location}"
            )
        }

    url = (
        "https://router.project-osrm.org/route/v1/driving/"
        f"{pickup['longitude']},{pickup['latitude']};"
        f"{destination['longitude']},{destination['latitude']}"
        "?overview=full&geometries=geojson"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "SmartAgriMarketplace/1.0"
        }
    )

    with urlopen(request, timeout=15) as response:
        data = json.loads(
            response.read().decode("utf-8")
        )

    if (
        data.get("code") != "Ok"
        or not data.get("routes")
    ):
        return {
            "error": "No road route found"
        }

    route = data["routes"][0]

    distance_km = round(
        route["distance"] / 1000,
        2
    )

    estimated_time_min = round(
        route["duration"] / 60
    )

    coordinates = route["geometry"]["coordinates"]

    print("ROUTE POINTS:", len(coordinates))

    # Select 4 intermediate points from the real road route
    total_points = len(coordinates)

    if total_points >= 5:
        selected_indexes = [
            total_points // 5,
            (total_points * 2) // 5,
            (total_points * 3) // 5,
            (total_points * 4) // 5
        ]

        intermediate_points = [
            coordinates[index]
            for index in selected_indexes
        ]
    else:
        intermediate_points = []

    intermediate_locations = []

    for point in intermediate_points:
        longitude = point[0]
        latitude = point[1]

        place = reverse_geocode_location(
            longitude,
            latitude
        )

        intermediate_locations.append(place)

    print(
        "INTERMEDIATE LOCATIONS:",
        intermediate_locations
    )

    return {
        "route": (
            f"{pickup_location} → "
            + " → ".join(intermediate_locations)
            + f" → {delivery_location}"
        ),
        "distance_km": distance_km,
        "estimated_time_min": estimated_time_min,
        "pickup_coordinates": [
            pickup["latitude"],
            pickup["longitude"]
        ],
        "delivery_coordinates": [
            destination["latitude"],
            destination["longitude"]
        ],
        "intermediate_locations": intermediate_locations,
        "intermediate_coordinates": [
            [point[1], point[0]]
            for point in intermediate_points
        ],
        "road_coordinates": [
            [point[1], point[0]]
            for point in coordinates
        ]
    }


@app.put("/deliveries/{delivery_id}/optimize")
def optimize_delivery(delivery_id: int):

    db = SessionLocal()

    delivery = (
        db.query(models.Delivery)
        .filter(
            models.Delivery.id == delivery_id
        )
        .first()
    )

    if not delivery:
        db.close()
        return {
            "error": "Delivery not found"
        }

    result = calculate_real_route(
        delivery.pickup_location,
        delivery.delivery_location
    )

    if "error" in result:
        db.close()
        return result

    delivery.route = result["route"]

    delivery.distance = result["distance_km"]

    delivery.estimated_time = (
        result["estimated_time_min"]
    )

    db.commit()

    db.refresh(delivery)

    db.close()

    return {
        "message": (
            "Delivery route optimized successfully"
        ),
        "delivery_id": delivery.id,
        "route": result["route"],
        "total_distance_km": result["distance_km"],
        "estimated_time_min": (
            result["estimated_time_min"]
        ),
        "pickup_coordinates": result["pickup_coordinates"],
        "delivery_coordinates": result["delivery_coordinates"],
        "intermediate_locations": result["intermediate_locations"],
        "intermediate_coordinates": result["intermediate_coordinates"],
        "road_coordinates": result["road_coordinates"]
    }


@app.put("/deliveries/{delivery_id}/in-transit")
def mark_delivery_in_transit(
    delivery_id: int
):

    db = SessionLocal()

    delivery = (
        db.query(models.Delivery)
        .filter(
            models.Delivery.id == delivery_id
        )
        .first()
    )

    if not delivery:
        db.close()
        return {
            "error": "Delivery not found"
        }

    if delivery.status != "ready":
        db.close()
        return {
            "error": (
                "Only ready deliveries "
                "can be marked as in transit"
            )
        }

    if not delivery.route:
        db.close()
        return {
            "error": (
                "Optimize the delivery route "
                "before starting transit"
            )
        }

    delivery.status = "in_transit"

    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == delivery.order_id
        )
        .first()
    )

    if order:
        order.status = "in_transit"

    db.commit()

    db.refresh(delivery)

    db.close()

    return {
        "message": (
            "Delivery marked as in transit"
        ),
        "delivery_id": delivery.id,
        "status": delivery.status
    }


@app.put("/deliveries/{delivery_id}/delivered")
def mark_delivery_delivered(
    delivery_id: int
):

    db = SessionLocal()

    delivery = (
        db.query(models.Delivery)
        .filter(
            models.Delivery.id == delivery_id
        )
        .first()
    )

    if not delivery:
        db.close()
        return {
            "error": "Delivery not found"
        }

    if delivery.status != "in_transit":
        db.close()
        return {
            "error": (
                "Only in-transit deliveries "
                "can be marked as delivered"
            )
        }

    delivery.status = "delivered"

    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == delivery.order_id
        )
        .first()
    )

    if order:
        order.status = "delivered"

    db.commit()

    db.refresh(delivery)

    db.close()

    return {
        "message": (
            "Delivery marked as delivered"
        ),
        "delivery_id": delivery.id,
        "status": delivery.status
    }


@app.put("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int,
    status: str
):

    db = SessionLocal()

    delivery = (
        db.query(models.Delivery)
        .filter(
            models.Delivery.id == delivery_id
        )
        .first()
    )

    if not delivery:
        db.close()
        return {
            "error": "Delivery not found"
        }

    allowed_statuses = [
        "pending",
        "in_transit",
        "delivered"
    ]

    if status not in allowed_statuses:
        db.close()
        return {
            "error": "Invalid delivery status",
            "allowed_statuses": allowed_statuses
        }

    delivery.status = status

    db.commit()

    db.refresh(delivery)

    db.close()

    return {
        "message": (
            "Delivery status updated successfully"
        ),
        "delivery_id": delivery.id,
        "status": delivery.status
    }


@app.post("/forecast")
def create_forecast(
    product: str = "tomato", location: str = "Mumbai", days_ahead: int = 7
):
    try:
        predicted_quantity = predict_demand(
            days_ahead=days_ahead, product=product, location=location
        )

    except ValueError:
        return JSONResponse(
            status_code=400,
            content={
                "error": f"Not enough historical demand data for {product} in {location}."
            },
        )

    forecast_date = date.today() + timedelta(days=days_ahead)

    forecast = save_forecast(
        product=product,
        location=location,
        forecast_date=forecast_date,
        predicted_quantity=predicted_quantity,
    )

    return {
        "message": "Demand forecast created successfully",
        "product": product,
        "location": location,
        "forecast_date": forecast_date,
        "predicted_quantity": predicted_quantity,
        "forecast_id": forecast.id,
    }


@app.get("/forecasts")
def get_forecasts():
    db = SessionLocal()
    forecasts = db.query(Forecast).all()
    result = [
        {
            "id": forecast.id,
            "product": forecast.product,
            "location": forecast.location,
            "forecast_date": forecast.forecast_date,
            "predicted_quantity": forecast.predicted_quantity,
        }
        for forecast in forecasts
    ]
    db.close()
    return result


@app.post("/login")
def login_user(email: str, password: str):
    db = SessionLocal()

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        db.close()
        return {"message": "Invalid email or password"}

    if user.password != password:
        db.close()
        return {"message": "Invalid email or password"}
    import secrets

    token = secrets.token_hex(32)
    TOKENS[token] = user.id

    db.close()

    return {
        "message": "Login successful",
        "token": token,
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


@app.post("/register")
def register_user(
    name: str, email: str, password: str, role: str, phone: str = "", location: str = ""
):
    db = SessionLocal()

    existing_user = db.query(models.User).filter(models.User.email == email).first()

    if existing_user:
        db.close()
        return {"message": "User with this email already exists"}

    if role not in ["farmer", "buyer"]:
        db.close()
        return {"message": "Role must be farmer or buyer"}

    user = models.User(
        name=name,
        email=email,
        password=password,
        role=role,
        phone=phone,
        location=location,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    db.close()

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }
