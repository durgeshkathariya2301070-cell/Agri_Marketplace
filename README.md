🌾 Smart Agri Marketplace

A Smart Agri Marketplace that connects farmers/FPOs with buyers and combines AI demand forecasting with real-road logistics optimization.

🚀 Features
👨‍🌾 Farmer Marketplace – Farmers can add, edit, and manage agricultural products.
🛒 Buyer Ordering – Buyers can browse products and place orders.
📦 Inventory Management – Stock is reduced only when a farmer accepts an order.
📋 Order Workflow – Pending → Accepted → Ready → In Transit → Delivered.
🚚 Logistics Optimization – Calculates real road distance and estimated travel time using OpenStreetMap and OSRM.
🗺️ Route Visualization – Displays optimized delivery routes on an interactive Leaflet map.
🤖 AI Demand Forecasting – Uses historical agricultural market data and Linear Regression to predict future demand.
📊 Historical Demand Data – Uses mandi market data initially and can transition to real marketplace delivered orders as demand history.
🛠️ Tech Stack

Frontend: React, Vite, React Router, Leaflet, React Leaflet
Backend: Python, FastAPI, SQLAlchemy
Database: PostgreSQL
AI/ML: Pandas, Scikit-learn, Linear Regression
Routing: OpenStreetMap Nominatim, OSRM

🔄 Project Flow
Farmer adds products
        ↓
Buyer places order
        ↓
Farmer accepts/rejects
        ↓
Inventory updated
        ↓
Order marked Ready
        ↓
Delivery created
        ↓
Real route optimized
        ↓
Delivery completed
        ↓
Actual demand history
        ↓
AI Demand Forecast
🎯 Goal

The goal is to reduce agricultural supply-chain inefficiencies by helping farmers and buyers connect directly, manage orders efficiently, optimize transportation, and make better production decisions using demand forecasting.
