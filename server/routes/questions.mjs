import express from 'express';
import Question from '../models/questionsdb.mjs';
import mongoose from 'mongoose';

const router = express.Router();

// Get all questions (optionally filtered by collectionId) with sorting
router.get("/", async (req, res) => {
  try {
    const { collectionId, sortBy = 'number', sortOrder = 'asc' } = req.query;
    const filter = collectionId ? { collectionId } : {};
    
    // Determine sort direction
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    
    // Create sort object
    const sortObj = {};
    if (sortBy === 'custom') {
      sortObj.sortOrder = sortDirection;
      sortObj.number = 1; // Secondary sort by number
    } else {
      sortObj[sortBy] = sortDirection;
    }
    
    const questions = await Question.find(filter).sort(sortObj);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a specific question by number (scoped by collectionId in query params)
router.get("/:number/:collectionId", async (req, res) => {
  try {
    const { number, collectionId } = req.params;

    const result = await Question.findOne({
      number: parseInt(number),
      collectionId: new mongoose.Types.ObjectId(collectionId),
    });

    if (!result) {
      return res.status(404).json({ message: "Question not found in this collection." });
    }

    res.status(200).json({ message: "Record found", data: result });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new question (now checks for uniqueness within the same collection)
router.post("/", async (req, res) => {
  try {
    const { number, collectionId, question, hint, answer, funFact, sortOrder = 0 } = req.body;

    const existing = await Question.findOne({ number, collectionId });
    if (existing) {
      return res.status(400).json({ message: `Question ${number} already exists in this collection.` });
    }

    const newQuestion = {
      number,
      collectionId,
      question,
      hint,
      answer,
      funFact,
      sortOrder
    };

    const result = await Question.create(newQuestion);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: "Server error while creating question", error: error.message });
  }
});

// Update a question (scoped by number + collectionId)
router.patch("/:number/:collectionId", async (req, res) => {
  try {
    const { number, collectionId } = req.params;
    const { question, hint, answer, funFact, sortOrder } = req.body;

    const query = { number: parseInt(number), collectionId };
    const updates = { $set: { question, hint, answer, funFact } };
    
    // Only update sortOrder if provided
    if (sortOrder !== undefined) {
      updates.$set.sortOrder = sortOrder;
    }

    const result = await Question.updateOne(query, updates);

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Question not found in this collection." });
    } else {
      res.status(200).json({ message: "Question updated successfully." });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating question", error: err.message });
  }
});

// Bulk update sort order for questions in a collection
router.patch("/bulk-sort/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { questions } = req.body; // Array of {number, sortOrder}

    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions must be an array" });
    }

    // Update each question's sort order
    const updatePromises = questions.map(({ number, sortOrder }) => 
      Question.updateOne(
        { number: parseInt(number), collectionId },
        { $set: { sortOrder } }
      )
    );

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Sort order updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating sort order", error: error.message });
  }
});

// Delete a question (scoped by number + collectionId as path params)
router.delete("/:number/:collectionId", async (req, res) => {
  try {
    const query = {
      number: parseInt(req.params.number),
      collectionId: req.params.collectionId,
    };

    const result = await Question.deleteOne(query);
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Question not found in this collection." });
    } else {
      res.status(200).json({ message: "Question deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting question", error: error.message });
  }
});

export default router;