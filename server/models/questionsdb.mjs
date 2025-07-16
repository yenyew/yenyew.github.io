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
    type: [String],
    required: true,
  },  
  hint: {
    type: String,
    required: true,
  },
  funFact: {
    type: String,
    required: true,
  },
  sortOrder: {
    type: Number,
    default: 0,  
  }
});

// Ensure that the combination of number and collectionId is unique
questionSchema.index({ number: 1, collectionId: 1 }, { unique: true });

// Create and export the Question model
const Question = mongoose.model('Question', questionSchema);

export default Question;