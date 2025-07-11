import express from 'express';
import AutoClearConfig from '../models/autoCleardb.mjs';

const router = express.Router();

// Get current auto-clear config
router.get("/", async (req, res) => {
  const config = await AutoClearConfig.findOne();
  res.status(200).json(config);
});

// Set or update auto-clear config
router.post("/", async (req, res) => {
  const { interval, target } = req.body;

  if (!['day', 'week', 'month'].includes(interval) || !['today', 'week', 'month', 'all'].includes(target)) {
    return res.status(400).send("Invalid interval or target");
  }

  let config = await AutoClearConfig.findOne();
  if (!config) {
    config = await AutoClearConfig.create({ interval, target });
  } else {
    config.interval = interval;
    config.target = target;
    await config.save();
  }

  res.status(200).json({ message: "Auto-clear config saved", config });
});

export default router;
