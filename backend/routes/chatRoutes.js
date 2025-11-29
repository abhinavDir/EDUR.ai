import express from "express";
import Chat from "../models/chatModel.js";

const router = express.Router();

// Save or Update Chat
router.post("/save", async (req, res) => {
  try {
    const { chatId, messages } = req.body;

    let chat = await Chat.findOne({ chatId });

    if (chat) {
      chat.messages = messages;
      await chat.save();
    } else {
      chat = await Chat.create({ chatId, messages });
    }

    res.json({ status: true, chat });
  } catch (err) {
    res.json({ status: false, error: err.message });
  }
});

// Fetch all chat list
router.get("/all", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json({ status: true, chats });
  } catch (err) {
    res.json({ status: false, error: err.message });
  }
});

export default router;
