import mongoose from "mongoose";

const globalSettingsSchema = new mongoose.Schema({
  defaultGameMode: { 
    type: String, 
    enum: ['default', 'random', 'rotating', 'rotating-reverse'], 
    default: 'default' 
  },
  defaultWrongAnswerPenalty: { type: Number, default: 300 }, // 5 minutes
  defaultHintPenalty: { type: Number, default: 120 }, // 2 minutes
  defaultSkipPenalty: { type: Number, default: 600 }, // 10 minutes
}, {
  timestamps: true
});

const GlobalSettings = mongoose.model("GlobalSettings", globalSettingsSchema);
export default GlobalSettings; 