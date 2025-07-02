  import mongoose from 'mongoose';

  const { Schema, model } = mongoose;

  const PlayerSchema = new Schema({
    username: {
      type: String,
      required: true,
    },
    score: {
        type: Number,
      default: 0, 
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
    rewardCode: {
      type: String,
      unique: true,
      sparse: true,
      default: () => {
        const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O/0/I/1
        const length = 8; // Length of the code
        let code = ''; 
        for (let i = 0; i < length; i++) { // Generate up to 8 characters
          code += charset[Math.floor(Math.random() * charset.length)]; // Generates a random character from the charset by generating a random num between 0 and 1, multiplying it by the length of the charset, and rounding it down to the nearest integer and finally selecting the character that matches index in the charset
        }
        return code;
      }
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
