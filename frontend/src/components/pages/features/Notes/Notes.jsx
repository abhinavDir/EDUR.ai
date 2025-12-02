// frontend/src/components/pages/NotesAnalytics.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notes.css";
import socket from "../../../../socket";   // ⭐ Real-time XP

export default function NotesAnalytics() {
  const [data, setData] = useState([]);

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  // ⭐ REAL TIME XP (no REST)
  const giveRealTimeXP = () => {
    if (!userId) return;
    socket.emit("featureUsed", {
      userId,
      feature: "analytics"   // backend knows this name
    });
  };

  // Load analytics + award XP
  const loadData = async () => {
    try {
      giveRealTimeXP(); // ⭐ XP increases LIVE
const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/data`);
      setData(res.data);
    } catch (err) {
      console.log("Error loading analytics", err);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5000);
    return () => clearInterval(id);
  }, []);

  // Compute values
  const totalUses = data.reduce((a, b) => a + (b.usedCount || 0), 0);
  const totalTime = data.reduce((a, b) => a + (b.totalTimeSpent || 0), 0);
  const avgAccuracy = data.length
    ? (data.reduce((a, b) => a + Number(b.avgAccuracy || 0), 0) / data.length).toFixed(1)
    : 0;

  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9"];

  let angle = 0;
  const slices = data.map((f, i) => {
    const slice = totalUses ? (f.usedCount / totalUses) * 360 : 0;
    const s = `${colors[i % colors.length]} ${angle}deg ${angle + slice}deg`;
    angle += slice;
    return s;
  });

  return (
    <div className="analytics-box">
      <h1 className="dash-title">📊 AI Analytics</h1>

      <div className="stats-row">
        <div className="stat-card">
          <h3>📌 Total Uses</h3>
          <p>{totalUses}</p>
        </div>

        <div className="stat-card">
          <h3>⏳ Total Time</h3>
          <p>{(totalTime / 60).toFixed(1)} min</p>
        </div>

        <div className="stat-card">
          <h3>🎯 Accuracy</h3>
          <p>{avgAccuracy}%</p>
        </div>
      </div>

      <h2 className="sub-title">📈 Feature Usage Split</h2>

      <div
        className="pie-only"
        style={{
          background: `conic-gradient(${slices.join(",")})`
        }}
      ></div>

      <div className="legend">
        {data.map((f, i) => (
          <div className="legend-item" key={i}>
            <span
              className="legend-color"
              style={{ background: colors[i % colors.length] }}
            />
            <span>{f.featureName} ({f.usedCount})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
