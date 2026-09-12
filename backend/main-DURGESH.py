from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine, Base, SessionLocal
from models import User, Product, Order, Delivery, DemandData, Forecast
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from forecast import predict_demand, save_forecast
from datetime import date, timedelta

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    "delivered"
]

Base.metadata.create_all(bind=engine)


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
    farmer_id: int
):
    db = SessionLocal()

    product = models.Product(
        name=name,
        quantity=quantity,
        unit=unit,
        price=price,
        location=location,
        farmer_id=farmer_id
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    db.close()

    return {
        "message": "Product added successfully",
        "product_id": product.id
    }


@app.get("/products")
def get_products():
    db = SessionLocal()

    products = db.query(models.Product).all()

    db.close()

    return products


@app.post("/orders")
def create_order(
    buyer_id: int,
    farmer_id: int,
    product_id: int,
    quantity: int
):
    db = SessionLocal()

    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if not product:
        db.close()
        return {"error": "Product not found"}

    if quantity <= 0:
        db.close()
        return {"error": "Quantity must be greater than 0"}

    if quantity > product.quantity:
        db.close()
        return {
            "error": "Not enough inventory",
            "available_quantity": product.quantity
        }

    total_price = quantity * product.price

    order = models.Order(
        buyer_id=buyer_id,
        farmer_id=farmer_id,
        product_id=product_id,
        quantity=quantity,
        total_price=total_price,
        status="pending"
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order created successfully",
        "order_id": order.id,
        "total_price": total_price
    }

@app.get("/orders")
def get_orders():
    db = SessionLocal()

    orders = db.query(models.Order).all()

    db.close()

    return orders


@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str
):
    db = SessionLocal()

    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if status not in ALLOWED_ORDER_STATUSES:
        db.close()
        return {
            "error": "Invalid status",
            "allowed_statuses": ALLOWED_ORDER_STATUSES
        }

    order.status = status

    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status
    }


@app.put("/orders/{order_id}/accept")
def accept_order(order_id: int):
    db = SessionLocal()

    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "pending":
        db.close()
        return {
            "error": "Only pending orders can be accepted",
            "current_status": order.status
        }

    product = db.query(models.Product).filter(
        models.Product.id == order.product_id
    ).first()

    if not product:
        db.close()
        return {"error": "Product not found"}

    if order.quantity > product.quantity:
        db.close()
        return {
            "error": "Not enough inventory",
            "available_quantity": product.quantity
        }

    product.quantity = product.quantity - order.quantity

    order.status = "accepted"

    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order accepted successfully",
        "order_id": order.id,
        "status": order.status
    }

@app.put("/orders/{order_id}/reject")
def reject_order(order_id: int):
    db = SessionLocal()

    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "pending":
        db.close()
        return {
            "error": "Only pending orders can be rejected",
            "current_status": order.status
        }

    order.status = "rejected"

    db.commit()
    db.refresh(order)
    db.close()

    return {
        "message": "Order rejected successfully",
        "order_id": order.id,
        "status": order.status
    }   

@app.post("/deliveries")
def create_delivery(
    order_id: int,
    vehicle_capacity: int
):
    db = SessionLocal()

    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()

    if not order:
        db.close()
        return {"error": "Order not found"}

    if order.status != "accepted":
        db.close()
        return {
            "error": "Delivery can only be created for accepted orders",
            "current_status": order.status
        }

    product = db.query(models.Product).filter(
        models.Product.id == order.product_id
    ).first()

    if not product:
        db.close()
        return {"error": "Product not found"}

    delivery = models.Delivery(
        order_id=order.id,
        pickup_location=product.location,
        delivery_location="Mumbai",
        vehicle_capacity=vehicle_capacity,
        status="pending"
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
        "status": delivery.status
    } 

@app.get("/deliveries")
def get_deliveries():
    db = SessionLocal()

    deliveries = db.query(models.Delivery).all()

    db.close()

    return deliveries    

DISTANCE_MATRIX = [
    [0, 210, 170],   # Nashik
    [210, 0, 150],   # Pune
    [170, 150, 0]    # Mumbai
]

LOCATIONS = [
    "Nashik",
    "Pune",
    "Mumbai"
] 

def calculate_estimated_time(distance):
    speed = 50  # km per hour
    return round((distance / speed) * 60)

def calculate_optimal_route():

    manager = pywrapcp.RoutingIndexManager(
        len(DISTANCE_MATRIX),
        1,
        0
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        return DISTANCE_MATRIX[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(
        distance_callback
    )

    routing.SetArcCostEvaluatorOfAllVehicles(
        transit_callback_index
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()

    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return None

    route = []
    total_distance = 0

    index = routing.Start(0)

    while not routing.IsEnd(index):

        node_index = manager.IndexToNode(index)
        route.append(LOCATIONS[node_index])

        previous_index = index
        index = solution.Value(routing.NextVar(index))

        total_distance += routing.GetArcCostForVehicle(
            previous_index,
            index,
            0
        )

    route.append(LOCATIONS[manager.IndexToNode(index)])

    return {
        "route": route,
        "total_distance_km": total_distance
    }

@app.put("/deliveries/{delivery_id}/optimize")
def optimize_delivery(delivery_id: int):

    db = SessionLocal()

    delivery = db.query(models.Delivery).filter(
        models.Delivery.id == delivery_id
    ).first()

    if not delivery:
        db.close()
        return {"error": "Delivery not found"}

    result = calculate_optimal_route()

    if not result:
        db.close()
        return {"error": "No route found"}

    delivery.route = " → ".join(result["route"])
    delivery.distance = result["total_distance_km"]

    delivery.estimated_time = calculate_estimated_time(
        result["total_distance_km"]
    )

    db.commit()
    db.refresh(delivery)
    db.close()

    return {
        "message": "Delivery route optimized successfully",
        "delivery_id": delivery.id,
        "route": result["route"],
        "total_distance_km": result["total_distance_km"]
    }

@app.get("/optimize-route")
def optimize_route():

    manager = pywrapcp.RoutingIndexManager(
        len(DISTANCE_MATRIX),
        1,
        0
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        return DISTANCE_MATRIX[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(
        distance_callback
    )

    routing.SetArcCostEvaluatorOfAllVehicles(
        transit_callback_index
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()

    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return {"error": "No route found"}

    route = []
    total_distance = 0

    index = routing.Start(0)

    while not routing.IsEnd(index):

        node_index = manager.IndexToNode(index)
        route.append(LOCATIONS[node_index])

        previous_index = index
        index = solution.Value(routing.NextVar(index))

        total_distance += routing.GetArcCostForVehicle(
            previous_index,
            index,
            0
        )

    route.append(LOCATIONS[manager.IndexToNode(index)])

    return {
        "route": route,
        "total_distance_km": total_distance
    }

@app.put("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int,
    status: str
):
    db = SessionLocal()

    delivery = db.query(models.Delivery).filter(
        models.Delivery.id == delivery_id
    ).first()

    if not delivery:
        db.close()
        return {"error": "Delivery not found"}

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
        "message": "Delivery status updated successfully",
        "delivery_id": delivery.id,
        "status": delivery.status
    }

@app.put("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int,
    status: str
):
    db = SessionLocal()

    delivery = db.query(models.Delivery).filter(
        models.Delivery.id == delivery_id
    ).first()

    if not delivery:
        db.close()
        return {"error": "Delivery not found"}

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
        "message": "Delivery status updated successfully",
        "delivery_id": delivery.id,
        "status": delivery.status
    }  

@app.post("/forecast")
def create_forecast(
    product: str = "tomato",
    location: str = "Mumbai",
    days_ahead: int = 7
):
    predicted_quantity = predict_demand(
        days_ahead=days_ahead,
        product=product,
        location=location
    )

    forecast_date = date.today() + timedelta(days=days_ahead)

    forecast = save_forecast(
        product=product,
        location=location,
        forecast_date=forecast_date,
        predicted_quantity=predicted_quantity
    )

    return {
        "message": "Demand forecast created successfully",
        "product": "tomato",
        "location": "Mumbai",
        "forecast_date": forecast_date,
        "predicted_quantity": predicted_quantity,
        "forecast_id": forecast.id
    } 

@app.get("/forecasts")
def get_forecasts():
    db = SessionLocal()

    forecasts = db.query(Forecast).all()

    result = []

    for forecast in forecasts:
        result.append({
            "id": forecast.id,
            "product": forecast.product,
            "location": forecast.location,
            "forecast_date": forecast.forecast_date,
            "predicted_quantity": forecast.predicted_quantity,
            
        })

    db.close()

    return result  

@app.post("/register")
def register_user(
    name: str,
    email: str,
    password: str,
    role: str,
    phone: str = "",
    location: str = ""
):
    db = SessionLocal()

    existing_user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if existing_user:
        db.close()
        return {
            "message": "User with this email already exists"
        }

    if role not in ["farmer", "buyer"]:
        db.close()
        return {
            "message": "Role must be farmer or buyer"
        }

    user = models.User(
        name=name,
        email=email,
        password=password,
        role=role,
        phone=phone,
        location=location
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
        "role": user.role
    }     

@app.post("/login")
def login_user(
    email: str,
    password: str
):
    db = SessionLocal()

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        db.close()
        return {
            "message": "Invalid email or password"
        }

    if user.password != password:
        db.close()
        return {
            "message": "Invalid email or password"
        }

    db.close()

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }          