import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true, // So each collection can be uniquely identified by code
  },
  questionOrder: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Question",
    default: []
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;