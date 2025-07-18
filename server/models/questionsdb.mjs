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
  type: {
    type: String,
    enum: ['mcq', 'open'],
    required: true,
  },
  options: {
    type: [String], // Only used for MCQ type
    default: undefined,
  },
  answer: {
    type: [String], // Can be one or more correct answers
    required: true,
  },
  hint: {
    type: String,
    required: true,
  },
  funFact: {
    type: String,
    required: true,
  }
});

questionSchema.index({ number: 1, collectionId: 1 }, { unique: true });

const Question = mongoose.model('Question', questionSchema);

export default Question;
