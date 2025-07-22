import express from 'express';
import Question from '../models/questionsdb.mjs';
import mongoose from 'mongoose';
import multer from "multer";
const upload = multer({ dest: "uploads/" }); 


const router = express.Router();

// Get all questions (optionally filtered by collectionId)
router.get("/", async (req, res) => {
  try {
    const { collectionId } = req.query;
    const filter = collectionId ? { collectionId } : {};
    
    const questions = await Question.find(filter);
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

// Create a new question
router.post("/", async (req, res) => {
  try {
    const { number, collectionId, question, hint, answer, funFact, type, options } = req.body;

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
      type,
    };

    // Optional: only include options if question type is MCQ
    if (type === "mcq" || type === "multiple-choice") {
      newQuestion.options = options;
    }

    const result = await Question.create(newQuestion);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: "Server error while creating question", error: error.message });
  }
});


// Update a question (scoped by number + collectionId)
router.patch("/:number/:collectionId", upload.single("image"), async (req, res) => {
  try {
    const { number, collectionId } = req.params;

    const questionDoc = await Question.findOne({
      number: parseInt(number),
      collectionId,
    });

    if (!questionDoc) {
      return res.status(404).json({ message: "Question not found in this collection." });
    }

    // Update fields from form
    if (req.body.question) questionDoc.question = req.body.question.trim();
    if (req.body.hint) questionDoc.hint = req.body.hint.trim();
    if (req.body.funFact) questionDoc.funFact = req.body.funFact.trim();
    if (req.body.type) questionDoc.type = req.body.type;

    if (req.body.answer) {
      try {
        questionDoc.answer = JSON.parse(req.body.answer);
      } catch {
        return res.status(400).json({ message: "Invalid JSON in 'answer'" });
      }
    }

    if (req.body.options) {
      try {
        questionDoc.options = JSON.parse(req.body.options);
      } catch {
        return res.status(400).json({ message: "Invalid JSON in 'options'" });
      }
    }

    if (req.file) {
      questionDoc.image = req.file.path;
    } else if (req.body.deleteImage === "true") {
      questionDoc.image = null;
    }

    await questionDoc.save();

    res.status(200).json({ message: "Question updated successfully." });
  } catch (err) {
    console.error("Error in PATCH /:number/:collectionId:", err);
    res.status(500).json({ message: "Error updating question", error: err.message });
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