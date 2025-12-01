import mongoose from "mongoose";

const DailyGoalsSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  date: { type: String, required: true }, // "2025-12-01"

  xpGoal: { type: Number, default: 500 },
  xpProgress: { type: Number, default: 0 },

  streakGoal: { type: Number, default: 1 },
  streakDone: { type: Boolean, default: false },

  studyMinutes: { type: Number, default: 0 }, 
  studyGoal: { type: Number, default: 60 },

  // ⭐ The MOST IMPORTANT field for proper minute tracking
  lastActivity: { type: Date, default: new Date() }
});

export default mongoose.model("DailyGoals", DailyGoalsSchema);
