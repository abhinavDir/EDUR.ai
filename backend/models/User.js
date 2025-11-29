// backend/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  mobile: { type: String, default: "" },
  purpose: { type: String, default: "" },
  avatarUrl: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
