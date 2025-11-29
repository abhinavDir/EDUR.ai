import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatId: { type: Number, required: true, unique: true },
    messages: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
