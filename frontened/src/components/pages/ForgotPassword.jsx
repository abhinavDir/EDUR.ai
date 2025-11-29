import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    alert(data.message || "Check your email for reset link");
  };

  return (
    <div style={{ maxWidth:600, margin:"30px auto", padding:20, background:"#fff", borderRadius:12 }}>
      <h2>Forgot Password</h2>
      <p>Enter your account email — we'll send a reset link.</p>
      <form onSubmit={submit}>
        <input required type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #e5e7eb"}} />
        <button style={{marginTop:12, padding:"10px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8}}>Send reset link</button>
      </form>
    </div>
  );
}
