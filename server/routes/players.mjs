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
    const collectionId = req.body.collectionId; 
    // We extract collectionId from the request body because it should link to a document in the 'collections' collection.
    // Since 'collection' is a reference field in the Player model, we must ensure the provided ID is valid and exists.

    if (!collectionId || !ObjectId.isValid(collectionId)) {
    return res.status(400).send("Invalid or missing collection ID");  
    } 
    // it must exist and be a valid MongoDB ObjectId, because we're storing it as a reference to another collection (Collections).

    
    const newPlayer = {
        username: req.body.username,
        score: req.body.score,
        totalTimeInSeconds: req.body.totalTimeInSeconds,
        startedAt: req.body.startedAt,
        finishedAt: req.body.finishedAt,
        rewardCode: req.body.rewardCode,
        hintsUsed: req.body.hintsUsed,
        collectionId: collectionId // Use the validated collectionId
    };

    const result = await Player.create(newPlayer);
    res.status(201).send(result);
});

// Update a player by id
router.patch("/:id", async (req, res) => {
    const collectionId = req.body.collectionId;

    if (!collectionId || !ObjectId.isValid(collectionId)) {
    return res.status(400).send("Invalid or missing collection ID");
    }

    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
        $set: {
            username: req.body.username,
            score: req.body.score,
            totalTimeInSeconds: req.body.totalTimeInSeconds,
            startedAt: req.body.startedAt,
            finishedAt: req.body.finishedAt,
            rewardCode: req.body.rewardCode,
            hintsUsed: req.body.hintsUsed,
            collectionId: collectionId
        }
    };

    const result = await Player.updateOne(query, updates);

    if (result.matchedCount === 0) res.status(404).send("Not found");
    else res.status(200).send(result);
});

export default router;