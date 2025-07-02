import express from 'express';
import Question from '../models/questionsdb.mjs';

const router = express.Router();
// Get all questions
router.get("/", async (req, res) => {
    const results = await Question.find({});
    res.status(200).send(results);
});


// Get questions by number
router.get("/:number",  async (req, res) => {
    try {
        let result = await Question.findOne({number: req.params.number});
        if (!result) {
            return res.status(404).json({ message: "Not found" });
        }
        res.status(200).json({ message: "Record found", data: result });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Create a new question
router.post("/", async (req, res) => {
    const newQuestion = {
        number: req.body.number,
        collectionId: req.body.collectionId,
        question: req.body.question,
        hint: req.body.hint,
        answer: req.body.answer,
    };

    const result = await Question.create(newQuestion);
    res.status(201).send(result);
});

// Update a question by number
router.patch("/:number", async (req, res) => {
    const query = { number: parseInt(req.params.number) };
    const updates = {
        $set: {
            number: req.body.number,
            collectionId: req.body.collectionId,
            question: req.body.question,
            hint: req.body.hint,
            answer: req.body.answer,
        }
    };

    const result = await Question.updateOne(query, updates);
    if (result.matchedCount === 0) res.status(404).send("Not found");
    else res.status(200).send(result);
});

// Delete a question by number
router.delete("/:number", async (req, res) => {
    const query = { number: parseInt(req.params.number) };
    const result = await Question.deleteOne(query);

    if (result.deletedCount === 0) res.status(404).send("Not found");
    else res.status(200).send({ message: "Question deleted successfully" });
});



export default router;