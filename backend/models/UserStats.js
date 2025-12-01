import mongoose from "mongoose";

const UserStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },

  streak: { type: Number, default: 0 },
  lastStudy: { type: Date, default: Date.now }
});

export default mongoose.model("UserStats", UserStatsSchema);
