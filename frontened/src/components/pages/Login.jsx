// frontend/src/components/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.status) {
        // save token
        localStorage.setItem("token", data.token);

        // SAVE USER (CRUCIAL for Dashboard)
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        if (setIsLoggedIn) setIsLoggedIn(true);
        window.dispatchEvent(new Event("storage"));

        // you said you navigate to home; keep it
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
    <div className="auth-box">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input required type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button>Login</button>
      </form>
    </div>
  );
}
