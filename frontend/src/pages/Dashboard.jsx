import FarmerDashboard from "./FarmerDashboard"
import BuyerDashboard from "./BuyerDashboard"

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"))

    if (user?.role === "farmer") {
        return <FarmerDashboard />
    }

    if (user?.role === "buyer") {
        return <BuyerDashboard />
    }

    return (
        <div>
            <h1>Invalid user role</h1>
            <p>Please login again.</p>
        </div>
    )
}

export default Dashboard