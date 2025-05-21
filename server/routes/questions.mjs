import express from 'express';
import Question from '../models/questionsdb.mjs';
import { ObjectId } from 'mongodb';

const router = express.Router();

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

export default router;