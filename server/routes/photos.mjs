import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  imageUrl: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Photo = mongoose.model("Photo", photoSchema);
export default Photo;
