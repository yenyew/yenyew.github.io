import mongoose from "mongoose";

const { Schema } = mongoose;

const BadUsernameSchema = new Schema({
  usernames: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const BadUsername = mongoose.model("BadUsername", BadUsernameSchema);

export default BadUsername;