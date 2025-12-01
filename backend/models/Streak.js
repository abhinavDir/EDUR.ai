import mongoose from "mongoose";

const StreakSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  streak: { type: Number, default: 0 },
  lastStudy: { type: Date, default: Date.now }
});

export default mongoose.model("Streak", StreakSchema);
