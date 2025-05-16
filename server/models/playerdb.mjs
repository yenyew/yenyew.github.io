import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const PlayerSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalTimeInSeconds: {
    type: Number,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  finishedAt: {
    type: Date,
    required: true,
  },
  rewardCode: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});

const Player = model('Player', PlayerSchema);
export default Player;
