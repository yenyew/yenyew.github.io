import express from 'express';
import Player from '../models/playerdb.mjs';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all players
router.get("/", async (req, res) => {
    const results = await Player.find({});
    res.status(200).send(results);
});

// Get a player by id
router.get("/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await Player.findOne(query);

    if (!result) res.status(404).send("Not found");
    else res.status(200).send(result);
});

// Create a new player
router.post("/", async (req, res) => {
    const newPlayer = {
        username: req.body.username,
        score: req.body.score,
        totalTimeInSeconds: req.body.totalTimeInSeconds,
        startedAt: req.body.startedAt,
        finishedAt: req.body.finishedAt,
        rewardCode: req.body.rewardCode,
    };

    const result = await Player.create(newPlayer);
    res.status(201).send(result);
});

// Update a player by id
router.patch("/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
        $set: {
            username: req.body.username,
            score: req.body.score,
            totalTimeInSeconds: req.body.totalTimeInSeconds,
            startedAt: req.body.startedAt,
            finishedAt: req.body.finishedAt,
            rewardCode: req.body.rewardCode,
        }
    };

    const result = await Player.updateOne(query, updates);

    if (result.matchedCount === 0) res.status(404).send("Not found");
    else res.status(200).send(result);
});

export default router;