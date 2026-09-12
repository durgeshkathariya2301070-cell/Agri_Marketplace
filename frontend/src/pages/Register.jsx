import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../services/api"

const COUNTRY_CODES = [
    { name: "India", code: "+91" },
    { name: "United States", code: "+1" },
    { name: "United Kingdom", code: "+44" },
    { name: "Canada", code: "+1" },
    { name: "Australia", code: "+61" },
    { name: "Germany", code: "+49" },
    { name: "France", code: "+33" },
    { name: "Spain", code: "+34" },
    { name: "Italy", code: "+39" },
    { name: "Netherlands", code: "+31" },
    { name: "Belgium", code: "+32" },
    { name: "Switzerland", code: "+41" },
    { name: "Austria", code: "+43" },
    { name: "Sweden", code: "+46" },
    { name: "Norway", code: "+47" },
    { name: "Denmark", code: "+45" },
    { name: "Finland", code: "+358" },
    { name: "Poland", code: "+48" },
    { name: "Czech Republic", code: "+420" },
    { name: "Romania", code: "+40" },
    { name: "Hungary", code: "+36" },
    { name: "Greece", code: "+30" },
    { name: "Portugal", code: "+351" },
    { name: "Ireland", code: "+353" },
    { name: "New Zealand", code: "+64" },
    { name: "Japan", code: "+81" },
    { name: "South Korea", code: "+82" },
    { name: "China", code: "+86" },
    { name: "Thailand", code: "+66" },
    { name: "Vietnam", code: "+84" },
    { name: "Philippines", code: "+63" },
    { name: "Singapore", code: "+65" },
    { name: "Malaysia", code: "+60" },
    { name: "Indonesia", code: "+62" },
    { name: "Pakistan", code: "+92" },
    { name: "Bangladesh", code: "+880" },
    { name: "Sri Lanka", code: "+94" },
    { name: "Nepal", code: "+977" },
    { name: "South Africa", code: "+27" },
    { name: "Egypt", code: "+20" },
    { name: "Nigeria", code: "+234" },
    { name: "Kenya", code: "+254" },
    { name: "Mexico", code: "+52" },
    { name: "Brazil", code: "+55" },
    { name: "Argentina", code: "+54" },
    { name: "Colombia", code: "+57" },
    { name: "Chile", code: "+56" },
    { name: "Peru", code: "+51" },
    { name: "Venezuela", code: "+58" },
    { name: "United Arab Emirates", code: "+971" },
    { name: "Saudi Arabia", code: "+966" },
    { name: "Israel", code: "+972" },
    { name: "Turkey", code: "+90" },
    { name: "Russia", code: "+7" },
    { name: "Ukraine", code: "+380" },
]

function Register() {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [countryCode, setCountryCode] = useState("+91")
    const [phone, setPhone] = useState("")
    const [location, setLocation] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState("farmer")
    const [agreeTerms, setAgreeTerms] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            alert("Passwords do not match!")
            return
        }

        if (!agreeTerms) {
            alert("Please agree to the terms and conditions")
            return
        }

        const fullPhone = countryCode + phone

        try {
            const data = await registerUser({
                name,
                email,
                password,
                role,
                phone: fullPhone,
                location
            })

            

            console.log("Registration successful:", data)
            navigate("/login")
        } catch (error) {
            alert(error.message)
            console.error("Registration failed:", error)
        }
    }
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>🌱 Agri Marketplace</h1>
                <h2>Create Your Account</h2>

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <div className="phone-input-group">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="country-code-select"
                            >
                                {COUNTRY_CODES.map((country) => (
                                    <option key={country.code + country.name} value={country.code}>
                                        {country.name} ({country.code})
                                    </option>
                                ))}
                            </select>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            id="location"
                            type="text"
                            placeholder="Enter your city or region"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <label style={{ marginBottom: "10px", display: "block", color: "var(--text-h)", fontWeight: "500", fontSize: "14px" }}>
                        I am a:
                    </label>

                    <div className="role-selector">
                        <div className="role-option">
                            <input
                                type="radio"
                                id="farmer"
                                name="role"
                                value="farmer"
                                checked={role === "farmer"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label htmlFor="farmer">👨‍🌾 Farmer</label>
                        </div>
                        <div className="role-option">
                            <input
                                type="radio"
                                id="buyer"
                                name="role"
                                value="buyer"
                                checked={role === "buyer"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label htmlFor="buyer">🛒 Buyer</label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <input
                            id="agreeTerms"
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            required
                        />
                        <label htmlFor="agreeTerms">I agree to the Terms and Conditions</label>
                    </div>

                    <button type="submit">Create Account</button>

                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    )
}

export default Register