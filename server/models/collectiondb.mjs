import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  questionOrder: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Question",
    default: []
  },
  // Game settings system
  useGlobalSettings: { 
    type: Boolean, 
    default: true 
  },
  // Only store custom overrides when useGlobalSettings = false
  customSettings: {
    gameMode: { 
      type: String, 
      enum: ['default', 'random', 'rotating', 'rotating-reverse']
    },
    wrongAnswerPenalty: { type: Number, min: 0 },
    hintPenalty: { type: Number, min: 0 },
    skipPenalty: { type: Number, min: 0 }
  }
}, {
  timestamps: true,
});

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;