// questionsdb.mjs
import mongoose from 'mongoose';

// Define the question schema
const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    required: true,
  }
});

// Create and export the Question model
const Question = mongoose.model('Question', questionSchema);

export default Question;