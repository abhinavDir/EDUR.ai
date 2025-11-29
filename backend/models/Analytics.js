import mongoose from "mongoose";

const dailySchema = new mongoose.Schema({
  date: String,
  count: Number,
  time: Number,
  accuracy: Number
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  featureName: { type: String, required: true, unique: true },
  usedCount: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  accuracySum: { type: Number, default: 0 },
  accuracyCount: { type: Number, default: 0 },
  daily: { type: [dailySchema], default: [] }
});

export default mongoose.model("Analytics", analyticsSchema);
