from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String)
    role = Column(String, nullable=False)
    location = Column(String)

    products = relationship("Product", back_populates="farmer")

    buyer_orders = relationship(
        "Order",
        foreign_keys="Order.buyer_id",
        back_populates="buyer"
    )

    farmer_orders = relationship(
        "Order",
        foreign_keys="Order.farmer_id",
        back_populates="farmer"
    )

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    quantity = Column(Integer, nullable=False)
    unit = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    location = Column(String)
    available_date = Column(String)

    farmer = relationship("User", back_populates="products")

    orders = relationship("Order", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="pending")

    buyer = relationship(
        "User",
        foreign_keys=[buyer_id],
        back_populates="buyer_orders"
    )

    farmer = relationship(
        "User",
        foreign_keys=[farmer_id],
        back_populates="farmer_orders"
    )

    product = relationship("Product", back_populates="orders")

    delivery = relationship(
        "Delivery",
        back_populates="order",
        uselist=False
    )


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    pickup_location = Column(String, nullable=False)
    delivery_location = Column(String, nullable=False)
    vehicle_capacity = Column(Integer)
    distance = Column(Integer)
    estimated_time = Column(Integer)
    route = Column(String)
    status = Column(String, nullable=False, default="pending")

    order = relationship("Order", back_populates="delivery")


class DemandData(Base):
    __tablename__ = "demand_data"

    id = Column(Integer, primary_key=True, index=True)
    product = Column(String, nullable=False)
    location = Column(String, nullable=False)
    date = Column(String, nullable=False)
    quantity_sold = Column(Integer, nullable=False)


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product = Column(String, nullable=False)
    location = Column(String, nullable=False)
    forecast_date = Column(String, nullable=False)
    predicted_quantity = Column(Integer, nullable=False)
