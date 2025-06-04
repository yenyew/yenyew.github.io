  import mongoose from 'mongoose';

  const { Schema, model } = mongoose;

  const PlayerSchema = new Schema({
    username: {
      type: String,
      required: true,
    },
    score: {
        type: Number,
      default: 0, // not required on creation
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
    rewardCode: {
      type: String,
      unique: true,
      sparse: true,
      default: () => {
        const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O/0/I/1
        const length = 8;
        let code = '';
        for (let i = 0; i < length; i++) {
          code += charset[Math.floor(Math.random() * charset.length)];
        }
        return code;
      }
    } 
  }, {
    timestamps: true,
  });

  const Player = model('Player', PlayerSchema);
  export default Player;
