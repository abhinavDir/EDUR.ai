import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import "./Dashboard.css";
import profile from "../../assets/profile.png"

export default function Dashboard() {
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved) setUser(saved);
  }, []);

  const pieData = [
    { name: "Ask AI", value: 40 },
    { name: "MCQ Generator", value: 30 },
    { name: "PDF Tools", value: 20 },
    { name: "Other", value: 10 },
  ];

  const COLORS = ["#4f46e5", "#0ea5e9", "#f97316", "#ef4444"];

  const barData = [
    { month: "Jan", value: 10 },
    { month: "Feb", value: 20 },
    { month: "Mar", value: 15 },
    { month: "Apr", value: 25 },
    { month: "May", value: 30 },
    { month: "Jun", value: 18 },
  ];

  return (
    <div className="img" style={{
      backgroundImage:`url(${profile})`,
      width:"100%"

    }}>
    <div className="dash-container">

      {/* Welcome Section */}
      <div className="welcome-card">
        <h2>👋 Welcome, {user.name || "User"}!</h2>
        <p>{user.email}</p>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">

        {/* PIE CHART */}
        <div className="chart-card">
          <h3>Feature Usage</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} outerRadius={90} dataKey="value" label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="chart-card">
          <h3>Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    
    </div>
    </div>
  );

}
