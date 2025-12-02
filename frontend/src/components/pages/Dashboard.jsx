// frontened/src/components/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import socket from "../../socket";
import confetti from "canvas-confetti";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from "recharts";

import NotificationCenter from "../../components/pages/Reminder";
import "./Dashboard.css";

import levelUpSoundFile from "../../assets/sounds/level-up.wav";
import achievementSoundFile from "../../assets/sounds/achievement.wav";
import profile from "../../assets/profile.png";

export default function Dashboard() {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const userId = savedUser?._id;

  const [user] = useState(savedUser || {});
  const [stats, setStats] = useState({ level:1, xp:0, xpNeeded:100, streak:0 });
  const [daily, setDaily] = useState(null);
  const [achievements, setAchievements] = useState([]);

  const levelUpAudio = useRef(null);
  const achievementAudio = useRef(null);
  const minuteTimerRef = useRef(null);

  useEffect(() => {
    levelUpAudio.current = new Audio(levelUpSoundFile);
    achievementAudio.current = new Audio(achievementSoundFile);
  }, []);

  // SOCKET REGISTER + REALTIME STAT UPDATES
  useEffect(() => {
    if (!userId) return;

    socket.emit("registerUser", userId);

    const onStats = (data) => {
      setStats({
        level: data.level,
        xp: data.xp,
        xpNeeded: data.xpNeeded,
        streak: data.streak
      });
      setDaily(data.daily || null);
    };

    const onStreak = (p) => {
      setStats(prev => ({ ...prev, streak: p.streak }));
      confetti({ particleCount: 80, spread: 60 });
    };

    const onAch = (a) => {
      achievementAudio.current?.play();
      setAchievements(prev => [a, ...prev]);
      confetti({ particleCount: 120, spread: 100 });
    };

    socket.on("statsUpdate", onStats);
    socket.on("streakUpdate", onStreak);
    socket.on("achievementUnlocked", onAch);

    // TAB-VISIBILITY BASED TIMER
    const startTimer = () => {
      if (minuteTimerRef.current) return;
      minuteTimerRef.current = setInterval(() => {
        socket.emit("activity", { userId });
      }, 60000 );
    };

    const stopTimer = () => {
      clearInterval(minuteTimerRef.current);
      minuteTimerRef.current = null;
    };

    if (document.visibilityState === "visible") startTimer();

    const handler = () => {
      if (document.visibilityState === "visible") startTimer();
      else stopTimer();
    };

    document.addEventListener("visibilitychange", handler);

    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handler);
      socket.off("statsUpdate", onStats);
      socket.off("streakUpdate", onStreak);
      socket.off("achievementUnlocked", onAch);
    };
  }, [userId]);

  const pieData = [
    { name: "Ask AI", value: 40 },
    { name: "MCQ", value: 28 },
    { name: "PDF", value: 18 },
    { name: "Other", value: 14 },
  ];

  const COLORS = ["#ff6bcb","#7c3aed","#06b6d4","#ffb020"];

  const barData = [
    { month: "Mon", value: 20 },
    { month: "Tue", value: 40 },
    { month: "Wed", value: 30 },
    { month: "Thu", value: 55 },
    { month: "Fri", value: 65 },
    { month: "Sat", value: 45 },
    { month: "Sun", value: 22 },
  ];

  const xpPercent = Math.min((stats.xp / stats.xpNeeded) * 100, 100);

  return (
    <div className="dashboard-root" style={{ backgroundImage:`url(${profile})` }}>
      
      {/* HEADER */}
      <div className="dash-top">
        <div className="dash-left">
          <div className="greeting">
            <div className="emoji-hero">✨🤖</div>
            <div>
              <h1 className="dash-title">
                Hi, {user.name || "Learner"} <span className="hi-emoji">👋</span>
              </h1>
              <p className="dash-sub">Level up your knowledge every day 🚀</p>
            </div>
          </div>

          <div className="meta-badges">
            <div className="badge neon-badge">🔥 Streak: <strong>{stats.streak}</strong></div>
            <div className="badge pastel-badge">⭐ Level <strong>{stats.level}</strong></div>
            <div className="badge glass-badge">⏱ Active: <strong>{daily?.studyMinutes ?? 0}m</strong></div>
          </div>
        </div>

        <div className="dash-actions">
          <NotificationCenter userId={userId} />
        </div>
      </div>

      {/* GRID */}
      <div className="dash-grid">

        {/* XP CARD */}
        <div className="dash-card big-card neon-card">
          <div className="card-row">

            <div>
              <div className="card-title">✨ XP Progress</div>
              <div className="level-block">
                <div className="level-value">⭐ {stats.level}</div>
                <div className="level-caption">Proficiency Level</div>
              </div>
            </div>

            <div className="xp-zone">
              <div className="xp-bar-glass">
                <div className="xp-fill-glow" style={{ width: `${xpPercent}%` }} />
                <div className="xp-overlay">
                  <span className="xp-text-strong">{Math.round(xpPercent)}%</span>
                  <span className="xp-small">{stats.xp}/{stats.xpNeeded} XP</span>
                </div>
              </div>

              <div className="mini-stats">
                <div className="mini-item">💡 Today XP: <strong>{daily?.xpProgress ?? 0}</strong></div>
                <div className="mini-item">⏱ Study: <strong>{daily?.studyMinutes ?? 0}m</strong></div>
                <div className="mini-item">🔥 Streak: <strong>{stats.streak}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* RESTORED ORIGINAL STREAK CARD */}
        <div className="dash-card streak-card">
          <div className="card-title-large">🔥 Your Streak</div>
          <div className="streak-body">
            <div className="streak-emoji">🔥</div>
            <div className="streak-count">{stats.streak}</div>
            <div className="streak-line">Stay active & earn bonus streaks!</div>

            <div className="streak-actions">
              <button
                className="btn-ghost"
                onClick={() => { confetti({ particleCount: 90, spread: 70 }); }}
              >
                Celebrate 🎉
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  navigator.clipboard?.writeText(`My study streak: ${stats.streak} 🔥`);
                }}
              >
                Share 📤
              </button>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="dash-card charts-card">
          <div className="card-title">📊 Activity Overview</div>
          <div className="charts-row">

            <div className="chart-half">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={60} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-half">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData}>
                  <XAxis dataKey="month" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="dash-card achievements-card">
          <div className="card-title">🏆 Achievements</div>

          {achievements.length === 0 ? (
            <div className="ach-empty">No achievements yet — keep going! ✨</div>
          ) : achievements.map((a, i) => (
            <div className="ach-item" key={i}>
              <div className="ach-icon">{a.icon || "🏅"}</div>
              <div className="ach-body">
                <div className="ach-title">{a.title}</div>
                <div className="ach-sub">
                  Unlocked — {new Date(a.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
              <div className="ach-bonus">+{a.xp || 0} XP</div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
