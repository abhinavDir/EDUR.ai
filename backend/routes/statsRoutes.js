import express from "express";
import UserStats from "../models/UserStats.js";

const router = express.Router();

// GET stats for user
router.get("/:userId", async (req, res) => {
  try {
    const stats = await UserStats.findOne({ userId: req.params.userId });

    if (!stats) {
      return res.json({
        userId: req.params.userId,
        level: 1,
        xp: 0,
        xpNeeded: 100,
        streak: 0,
      });
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
