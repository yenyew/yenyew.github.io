import express from 'express';
import Player from '../models/playerdb.mjs';
import mongoose from 'mongoose';

const router = express.Router();

// Get a list of all players
router.get('/', async (req, res) => {
  let results = await Player.find({});
  res.send(results).status(200);
});

// Get a player by ID
router.get('/:id', async (req, res) => {
  let query = { _id: new mongoose.Types.ObjectId(req.params.id) };
  let result = await Player.findOne(query);

  if (!result) res.send('Not found').status(404);
  else res.send(result).status(200);
});

// Create a new player
router.post('/', async (req, res) => {
  let newPlayer = {
    username: req.body.username,
    score: req.body.score,
    totalTimeInSeconds: req.body.totalTimeInSeconds,
    startedAt: req.body.startedAt,
    finishedAt: req.body.finishedAt,
    rewardCode: req.body.rewardCode,
  };

  let result = await Player.create(newPlayer);
  res.send(result).status(204);
});

export default router;
