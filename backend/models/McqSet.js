import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  qno: Number,
  question: String,
  options: [String],
  correct: String,
  explain: String
});

const McqSet = new mongoose.Schema({
  setId: Number,
  topic: String,
  mcqs: [OptionSchema]
});

export default mongoose.model("mcqsets", McqSet);
