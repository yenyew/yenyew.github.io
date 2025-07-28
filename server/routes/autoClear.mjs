import express from 'express';
import AutoClearConfig from '../models/autoCleardb.mjs';
import AutoClearLog from '../models/autoClearLogsdb.mjs'; 

const router = express.Router();

// GET config for a specific collection
router.get('/:collectionId', async (req, res) => {
  const { collectionId } = req.params;
  try {
    const config = await AutoClearConfig.findOne({ collectionId });
    if (!config) return res.status(404).json({ message: 'No config found' });
    res.status(200).json(config);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE or UPDATE config for a specific collection
router.post('/:collectionId', async (req, res) => {
  const { collectionId } = req.params;
  const { interval, target, startDate, endDate, customIntervalValue, customIntervalUnit } = req.body;

  if (!['day', 'week', 'month', 'custom'].includes(interval)) {
    return res.status(400).send("Invalid interval");
  }
  if (!['today', 'week', 'month', 'custom', 'all'].includes(target)) {
    return res.status(400).send("Invalid target");
  }
  if ((interval === 'custom' && (!customIntervalValue || !customIntervalUnit)) ||
      (target === 'custom' && (!startDate || !endDate))) {
    return res.status(400).send("Required fields missing for custom interval/target");
  }

  try {
    const config = await AutoClearConfig.findOneAndUpdate(
      { collectionId },
      { interval, target, startDate, endDate, customIntervalValue, customIntervalUnit },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: "Config saved", config });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save config', error: err.message });
  }
});
// DELETE config for a specific collection
router.delete('/:collectionId', async (req, res) => {
  const { collectionId } = req.params;
  try {
    const result = await AutoClearConfig.findOneAndDelete({ collectionId });
    if (!result) return res.status(404).json({ message: 'No config found to delete' });
    res.status(200).json({ message: 'Config deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

router.get('/:collectionId/logs', async (req, res) => {
  const { collectionId } = req.params;
  try {
    const logs = await AutoClearLog.find({ collectionId }).sort({ clearedAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch logs', error: err.message });
  }
});

export default router;
