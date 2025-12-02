// frontend/src/components/pages/Signup.jsx

import { useState } from "react";
import "./Login.css";
import profile from "../../assets/aipage.png";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // ⭐ Backend URL (Works on localhost + Vercel)
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.status) {
        alert("Signup Successful!");
      } else {
        alert(data.msg || "Signup failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      alert("Network Error");
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
        <h2>Signup</h2>

        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            required
            type="email"
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            required
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}
