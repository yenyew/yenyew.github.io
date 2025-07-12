import mongoose from 'mongoose';

const AutoClearSchema = new mongoose.Schema({
  interval: {
    type: String,
    enum: ['day', 'week', 'month', 'custom'], 
    required: true,
  },
  target: {
    type: String,
    enum: ['today', 'week', 'month', 'custom', 'all'], 
    required: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
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
