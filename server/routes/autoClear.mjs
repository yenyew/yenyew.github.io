// routes/autoClear.mjs
import express from 'express';
import AutoClearConfig from '../models/autoCleardb.mjs';

const router = express.Router();

router.get('/', async (req, res) => {
  const config = await AutoClearConfig.findOne();
  res.status(200).json(config);
});

router.post('/', async (req, res) => {
  const { interval, target, startDate, endDate } = req.body;

  if (!['day', 'week', 'month', 'custom'].includes(interval)) {
    return res.status(400).send("Invalid interval");
  }

  if (!['today', 'week', 'month', 'custom', 'all'].includes(target)) {
    return res.status(400).send("Invalid target");
  }

  if (target === 'custom' && (!startDate || !endDate)) {
    return res.status(400).send("Start and end date required for custom target");
  }

  if (interval === 'custom' && (!startDate || !endDate)) {
    return res.status(400).send("Start and end date required for custom interval");
  }

  let config = await AutoClearConfig.findOne();
  if (!config) {
    config = await AutoClearConfig.create({ interval, target, startDate, endDate });
  } else {
    config.interval = interval;
    config.target = target;
    config.startDate = startDate;
    config.endDate = endDate;
    await config.save();
  }

  res.status(200).json({ message: "Auto-clear config saved", config });
});

export default router;
