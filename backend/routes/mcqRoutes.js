import express from "express";
import MCQ from "../models/McqSet.js";

const router = express.Router();

// SAVE MCQ SET
router.post("/save", async (req, res) => {
  const { setId, topic, mcqs } = req.body;

  await MCQ.findOneAndUpdate(
    { setId },
    { setId, topic, mcqs },
    { upsert: true }
  );

  res.json({ status: true });
});

// GET ALL SETS
router.get("/all", async (req, res) => {
  const sets = await MCQ.find();
  res.json({ status: true, sets });
});

export default router;
