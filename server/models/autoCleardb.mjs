import mongoose from 'mongoose';

const AutoClearSchema = new mongoose.Schema({
  interval: {
    type: String, // "day", "week", "month"
    enum: ['day', 'week', 'month'],
    required: true,
  },
  target: {
    type: String, // "today", "week", "month", "all"
    enum: ['today', 'week', 'month', 'all'],
    required: true,
  },
  lastClearedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

const AutoClearConfig = mongoose.model('AutoClearConfig', AutoClearSchema);
export default AutoClearConfig;
