// backend/routes/studyRoutes.js
import express from "express";
import UserStats from "../models/UserStats.js";
import DailyGoals from "../models/DailyGoals.js";
import Streak from "../models/Streak.js";

const router = express.Router();

const XP_REWARD = {
  askAI: 10,
  grammar: 12,
  mcq: 15,
  pdf: 6,
  location: 5,
  analytics: 4,
  featureUse: 5
};

const xpNeeded = (lvl) => lvl * 100;

router.post("/feature-used", async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!userId || !type) return res.status(400).json({ error: "userId/type required" });

    const xpAdd = XP_REWARD[type] || 5;

    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({
        userId,
        level: 1,
        xp: 0,
        streak: 0,
        lastStudy: new Date(),
      });
    }

    stats.xp += xpAdd;
    stats.lastStudy = new Date();

    let need = xpNeeded(stats.level);
    while (stats.xp >= need) {
      stats.xp -= need;
      stats.level++;
      need = xpNeeded(stats.level);
    }

    await stats.save();

    const today = new Date().toISOString().slice(0, 10);
    let daily = await DailyGoals.findOne({ userId, date: today });

    if (!daily) {
      daily = await DailyGoals.create({
        userId,
        date: today,
        xpGoal: 60,
        streakGoal: 1,
        studyGoal: 10,
        xpProgress: xpAdd,
        studyMinutes: 0,
        streakDone: false,
      });
    } else {
      daily.xpProgress += xpAdd;
      await daily.save();
    }

    let streak = await Streak.findOne({ userId });
    if (!streak) streak = await Streak.create({ userId, streak: 0 });

    // If daily studyGoal already met, and xp goal met, award streak (keeps existing logic)
    if (
      !daily.streakDone &&
      daily.xpProgress >= daily.xpGoal &&
      daily.studyMinutes >= daily.studyGoal
    ) {
      daily.streakDone = true;
      await daily.save();
      streak.streak++;
      await streak.save();
    }

    // Emit real-time stats to user's socket if connected
    try {
      const socketId = global.clients?.[userId];
      if (socketId && global.io) {
        global.io.to(socketId).emit("statsUpdate", {
          level: stats.level,
          xp: stats.xp,
          xpNeeded: xpNeeded(stats.level),
          streak: streak.streak,
          daily,
        });
      }
    } catch (err) {
      console.log("Socket emit failed:", err);
    }

    return res.json({
      status: true,
      xpAdded: xpAdd,
      level: stats.level,
      xp: stats.xp,
      xpNeeded: xpNeeded(stats.level),
      streak: streak.streak,
      daily,
    });
  } catch (err) {
    console.error("studyRoutes error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
