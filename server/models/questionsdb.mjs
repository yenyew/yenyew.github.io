// questionsdb.mjs
import mongoose from 'mongoose';


const questionSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
    required: true,
  },
  question: {
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