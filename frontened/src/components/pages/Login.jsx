// frontend/src/components/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import profile from "../../assets/aipage.png";

export default function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // ⭐ Backend URL (Local + Production)
  // Local = http://localhost:5000
  // Vercel = uses VITE_API_URL
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.status) {
        // Save token
        localStorage.setItem("token", data.token);

        // Save user data
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Update login state
        if (setIsLoggedIn) setIsLoggedIn(true);

        // Notify other components
        window.dispatchEvent(new Event("storage"));

        // Redirect to Home page
        navigate("/");
      } else {
        alert(data.msg || "Login failed");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      alert("Network error");
    }
  };

  return (
    <div
      className="login-bg"
      style={{
        backgroundImage: `url(${profile})`,
      }}
    >
      <div className="auth-box">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
