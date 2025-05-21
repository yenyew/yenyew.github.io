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

router.get("/:number", async (req,res)=> {
    let collection = await db.collection("questions");
    let query = {_id: new ObjectId(req.params.number)};
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

router.post("/", async (req,res)=> {
    let newQuestion= {
        number: req.body.number,
        question: req.body.question,
        hint: req.body.hint,
        answer: req.body.answer,
    };

    const result = await Question.create(newQuestion);
    res.status(201).send(result)


});

router.patch("/:number", async (req,res) =>{
    const query = { _id: new ObjectId(req.params.number)};
    const updates= {
        $set: {
            number: req.body.number,
            question: req.body.question,
            hint: req.body.hint,
            answer: req.body.number,
        }
    };

    const result = await Question.updateOne(query, updates);
    if (result.matchedCount === 0) res.status(404).send("Not found");
    else res.status(200).send(result);
});


router.delete('/:id', async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await Question.deleteOne(query);

    if (result.deletedCount === 0) res.status(404).send("Not found");
    else res.status(200).send({ message: "Question deleted successfully" });
});


export default router;