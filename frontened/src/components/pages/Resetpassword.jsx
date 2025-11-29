import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get("token");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pwd })
    });
    const data = await res.json();
    alert(data.message || "Password reset");
    if (data.success) navigate("/login");
  };

  return (
    <div style={{ maxWidth:600, margin:"30px auto", padding:20, background:"#fff", borderRadius:12 }}>
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input required type="password" placeholder="New password" value={pwd} onChange={(e)=>setPwd(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #e5e7eb"}} />
        <button style={{marginTop:12, padding:"10px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8}}>Reset</button>
      </form>
    </div>
  );
}
