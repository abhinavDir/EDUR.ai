import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  icon: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Achievement", AchievementSchema);
