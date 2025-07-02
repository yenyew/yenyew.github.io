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

// Get a single collection by code
router.get("/with-questions", async (req, res) => {
  try {
    const collections = await Collection.aggregate([
      {
        $lookup: {
          from: "questions",           // collection name in MongoDB (usually lowercase + plural)
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
    const newCollection = await Collection.create({ name, code });
    res.status(201).json(newCollection);
  } catch (error) {
    res.status(400).json({ message: "Failed to create collection", error: error.message });
  }
});

export default router;
