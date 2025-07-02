import express from 'express';
import Collection from '../models/collectiondb.mjs';
import Question from "../models/questionsdb.mjs";

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

// Get all collections with their questions
router.get("/with-questions", async (req, res) => {
  try {
    const collections = await Collection.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "collectionId",
          as: "questions"
        }
      }
    ]);

    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: "Aggregation failed", error: error.message });
  }
});

// Get questions by collection code
router.get('/:code/questions', async (req, res) => {
  try {
    const collection = await Collection.findOne({ code: req.params.code });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const questions = await Question.find({ collectionId: collection._id });

    res.status(200).json({
      collection: collection.name,
      code: collection.code,
      questions: questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
  }
});

// Create a new collection
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;

    const existing = await Collection.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Collection code must be unique" });
    }

    const newCollection = await Collection.create({ name, code });
    res.status(201).json(newCollection);
  } catch (error) {
    res.status(400).json({ message: "Failed to create collection", error: error.message });
  }
});

// Update an existing collection
router.patch('/:id', async (req, res) => {
  try {
    const { name, code } = req.body;

    const updated = await Collection.findByIdAndUpdate(
      req.params.id,
      { name, code },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update collection", error: error.message });
  }
});

// Delete a collection
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Collection.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Optional: Also delete questions in the collection
    await Question.deleteMany({ collectionId: deleted._id });

    res.status(200).json({ message: "Collection and related questions deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete collection", error: error.message });
  }
});

// Get a single collection by its code
router.get('/:code', async (req, res) => {
  try {
    const collection = await Collection.findOne({
      code: new RegExp(`^${req.params.code.trim()}$`, "i") // case-insensitive match
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch collection", error: error.message });
  }
});

export default router;
