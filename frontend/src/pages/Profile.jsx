
import { useEffect, useState } from "react"
import { getProfile, updateProfile } from "../services/api"

function Profile() {
  const [profile, setProfile] = useState(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [location, setLocation] = useState("")

  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await getProfile()

      setProfile(data)
      setName(data.name || "")
      setLocation(data.location || "")

      if (data.phone) {
        const phoneParts = data.phone.trim().split(/\s+/)

        if (phoneParts.length > 1) {
          setCountryCode(phoneParts[0])
          setPhone(phoneParts.slice(1).join(" "))
        } else {
          setCountryCode("+91")
          setPhone(data.phone)
        }
      } else {
        setCountryCode("+91")
        setPhone("")
      }
    } catch (error) {
      setMessage("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }
  const handleEdit = () => {
    setEditing(true)
    setMessage("")
  }

  const handleSave = async () => {
    try {
      const fullPhone = `${countryCode} ${phone}`.trim()

      const data = await updateProfile(
        name,
        fullPhone,
        location
      )

      setProfile(data)

      setName(data.name || "")
      setPhone(data.phone || "")
      setCountryCode(countryCode)
      setLocation(data.location || "")

      const storedUser = JSON.parse(localStorage.getItem("user"))

      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name: data.name,
            email: data.email,
            role: data.role
          })
        )
      }

      setEditing(false)
      setMessage("Profile updated successfully")
    } catch (error) {
      setMessage("Failed to update profile")
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1>My Profile</h1>
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-container">
        <h1>My Profile</h1>
        <p>{message}</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1>My Profile</h1>

      <div className="profile-card">

        <div className="profile-main-info">

          <div className="profile-row">
            <strong>Name</strong>

            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <span>{profile.name}</span>
            )}
          </div>

          <div className="profile-row">
            <strong>Phone</strong>

            {editing ? (
              <div className="phone-input">

                <input
                  className="country-code-input"
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="+91"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />

              </div>
            ) : (
              <span>
                {profile.phone || "Not provided"}
              </span>
            )}
          </div>

          <div className="profile-row">
            <strong>Location</strong>

            {editing ? (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
              />
            ) : (
              <span>{profile.location || "Not provided"}</span>
            )}
          </div>

        </div>

        <div className="profile-actions">

          {!editing && (
            <button onClick={handleEdit}>
              Edit Profile
            </button>
          )}

          {editing && (
            <>
              <button onClick={handleSave}>
                Save Changes
              </button>

              <button
                className="cancel-profile-btn"
                onClick={() => {
                  setEditing(false)
                  setName(profile.name || "")
                  setPhone(profile.phone || "")
                  setCountryCode("+91")
                  setLocation(profile.location || "")
                }}
              >
                Cancel
              </button>
            </>
          )}

        </div>

        {message && (
          <p className="profile-message">
            {message}
          </p>
        )}

        <div className="profile-account-info">

          <div className="profile-row">
            <strong>User ID</strong>
            <span>{profile.user_id}</span>
          </div>

          <div className="profile-row">
            <strong>Email</strong>
            <span>{profile.email}</span>
          </div>

          <div className="profile-row">
            <strong>Role</strong>
            <span>{profile.role}</span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Profile

