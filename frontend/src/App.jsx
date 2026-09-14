import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Orders from "./pages/Orders"
import Deliveries from "./pages/Deliveries"
import Forecast from "./pages/Forecast"
import AddProduct from "./pages/AddProduct"
import EditProduct from "./pages/EditProduct"
import RouteMapPage from "./pages/RouteMapPage"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import OrderHistory from "./pages/OrderHistory"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deliveries"
          element={
            <ProtectedRoute>
              <Deliveries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/forecast"
          element={
            <ProtectedRoute>
              <Forecast />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-product/:productId"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }

        />

        <Route
          path="/deliveries/:deliveryId/map"
          element={
            <ProtectedRoute>
              <RouteMapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deliveries/:deliveryId/map"
          element={
            <ProtectedRoute>
              <RouteMapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/order-history"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>


    </BrowserRouter>
  )
}

export default App