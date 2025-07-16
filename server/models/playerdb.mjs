  import mongoose from 'mongoose';

  const { Schema, model } = mongoose;

  const PlayerSchema = new Schema({
    username: {
      type: String,
      required: true,
    },
    totalTimeInSeconds: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    questionsSkipped: { 
      type: Number,
      default: 0,
    },
    wrongAnswers: { 
      type: Number,
      default: 0,
    },
    redeemed: {
      type: Boolean,
      default: false
    },
    redeemedAt: {
      type: Date,
      default: null
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection", // Reference to the Collection model
      required: true, // Ensure that every player is associated with a collection
    }
  }, {
    timestamps: true,
  });

  const Player = model('Player', PlayerSchema);
  export default Player;
