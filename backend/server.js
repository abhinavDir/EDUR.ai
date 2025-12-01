// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

import UserActivity from "./models/UserActivity.js";
import Streak from "./models/Streak.js";
import UserStats from "./models/UserStats.js";
import DailyGoals from "./models/DailyGoals.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import mcqRoutes from "./routes/mcqRoutes.js";
import placeRoutes from "./routes/placesRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// GLOBAL userId → socketId map
const clients = {};
global.clients = clients;

const XP_LEVEL_BASE = 100;
const xpNeeded = (lvl) => lvl * XP_LEVEL_BASE;

// SOCKET HANDLING
io.on("connection", (socket) => {

  // -------------------------
  // USER REGISTERED
  // -------------------------
  socket.on("registerUser", (userId) => {
    if (!userId) return;
    clients[userId] = socket.id;
  });

  // -------------------------
  // REQUEST INITIAL STATS
  // -------------------------
  socket.on("requestStats", async ({ userId }) => {
    try {
      const stats = await UserStats.findOne({ userId });
      const today = new Date().toISOString().slice(0, 10);
      const daily = await DailyGoals.findOne({ userId, date: today });
      const streak = await Streak.findOne({ userId });

      io.to(socket.id).emit("statsUpdate", {
        level: stats?.level || 1,
        xp: stats?.xp || 0,
        xpNeeded: stats ? xpNeeded(stats.level) : xpNeeded(1),
        streak: streak?.streak || 0,
        daily
      });
    } catch (err) {
      console.log("requestStats error:", err);
    }
  });

  // -------------------------
  // REAL MINUTES ACTIVITY
  // -------------------------
  socket.on("activity", async ({ userId }) => {
    if (!userId) return;
    const now = new Date();
    const today = new Date().toISOString().slice(0, 10);

    // Daily doc
    let daily = await DailyGoals.findOne({ userId, date: today });
    if (!daily) {
      daily = await DailyGoals.create({
        userId,
        date: today,
        xpGoal: 60,
        streakGoal: 1,
        studyGoal: 10,
        xpProgress: 0,
        studyMinutes: 0,
        streakDone: false,
        lastActivity: now
      });
    }

    // REAL TIME DIFFERENCE CALCULATION
    const last = daily.lastActivity || now;
    const diffMs = now - last;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes > 0) {
      daily.studyMinutes += diffMinutes;
      daily.lastActivity = now;
      await daily.save();
    }

    const mins = daily.studyMinutes;

    // -------------------------
    // FIXED STREAK MILESTONES
    // -------------------------
    let addStreak = 0;

    if (mins === 15) addStreak = 1;
    if (mins === 30) addStreak = 2;
    if (mins === 60) addStreak = 5;
    if (mins === 120) addStreak = 7;

    let streak = await Streak.findOne({ userId });
    if (!streak) streak = await Streak.create({ userId, streak: 0 });

    if (addStreak > 0) {
      streak.streak += addStreak;
      await streak.save();

      const sid = clients[userId];
      if (sid) {
        io.to(sid).emit("streakUpdate", {
          streak: streak.streak,
          minutes: mins,
          added: addStreak
        });
      }
    }

    // SEND LIVE DASHBOARD UPDATE
    const userStats = await UserStats.findOne({ userId });
    const sid = clients[userId];
    if (sid) {
      io.to(sid).emit("statsUpdate", {
        level: userStats?.level || 1,
        xp: userStats?.xp || 0,
        xpNeeded: xpNeeded(userStats?.level || 1),
        streak: streak.streak,
        daily
      });
    }
  });

  // -------------------------
  // DISCONNECT
  // -------------------------
  socket.on("disconnect", () => {
    for (const uid in clients) {
      if (clients[uid] === socket.id) delete clients[uid];
    }
  });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mcq", mcqRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/study", studyRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

export default app;
