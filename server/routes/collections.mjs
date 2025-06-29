import express from 'express';
import Collection from '../models/collectiondb.mjs';

const router = express.Router();

// Get all collections
router.get('/', async (req, res) => {
  try {
    const results = await Collection.find({});
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a single collection by code
router.get('/:code', async (req, res) => {
  try {
    const result = await Collection.findOne({ code: req.params.code });
    if (!result) {
      return res.status(404).json({ message: "Collection not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new collection
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    const newCollection = await Collection.create({ name, code });
    res.status(201).json(newCollection);
  } catch (error) {
    res.status(400).json({ message: "Failed to create collection", error: error.message });
  }
});

export default router;
