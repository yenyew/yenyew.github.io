import express from 'express';
import Collection from '../models/collectiondb.mjs';
import Question from "../models/questionsdb.mjs";
import GlobalSettings from "../models/globalSettingsdb.mjs"; // Add this import

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
    const collection = await Collection.findOne({ code: req.params.code }).populate('questionOrder');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // If questionOrder is empty or not set, return questions in default order
    let questions;
    if (collection.questionOrder && collection.questionOrder.length > 0) {
      questions = collection.questionOrder; // Already populated
    } else {
      questions = await Question.find({ collectionId: collection._id });
    }

    res.status(200).json({
      collection: collection.name,
      code: collection.code,
      questions: questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
  }
});

// Get effective settings for a collection
router.get('/:id/effective-settings', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    let globalSettings = await GlobalSettings.findOne();
    if (!globalSettings) {
      // Create default global settings if none exist
      globalSettings = await GlobalSettings.create({
        defaultGameMode: 'default',
        defaultWrongAnswerPenalty: 300,
        defaultHintPenalty: 120,
        defaultSkipPenalty: 600
      });
    }

    let effectiveSettings;
    if (collection.useGlobalSettings !== false) { // Default to true if not set
      effectiveSettings = {
        gameMode: globalSettings.defaultGameMode,
        wrongAnswerPenalty: globalSettings.defaultWrongAnswerPenalty,
        hintPenalty: globalSettings.defaultHintPenalty,
        skipPenalty: globalSettings.defaultSkipPenalty,
        usingGlobalSettings: true
      };
    } else {
      effectiveSettings = {
        gameMode: collection.customSettings?.gameMode || globalSettings.defaultGameMode,
        wrongAnswerPenalty: collection.customSettings?.wrongAnswerPenalty || globalSettings.defaultWrongAnswerPenalty,
        hintPenalty: collection.customSettings?.hintPenalty || globalSettings.defaultHintPenalty,
        skipPenalty: collection.customSettings?.skipPenalty || globalSettings.defaultSkipPenalty,
        usingGlobalSettings: false
      };
    }

    res.status(200).json(effectiveSettings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get effective settings", error: error.message });
  }
});

// Create a new collection
router.post('/', async (req, res) => {
  try {
    const { name, code, questionOrder = [], gameMode = 'default' } = req.body;

    const existing = await Collection.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Collection code must be unique" });
    }

    const newCollection = await Collection.create({ name, code, questionOrder, gameMode });
    res.status(201).json(newCollection);
  } catch (error) {
    res.status(400).json({ message: "Failed to create collection", error: error.message });
  }
});

// Update an existing collection
router.patch('/:id', async (req, res) => {
  try {
    const { name, code, questionOrder, gameMode } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (questionOrder) updateData.questionOrder = questionOrder;
    if (gameMode) updateData.gameMode = gameMode;

    const updated = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// Update question order for a collection
router.patch('/:id/question-order', async (req, res) => {
  try {
    const { questionOrder } = req.body;

    if (!Array.isArray(questionOrder)) {
      return res.status(400).json({ message: "questionOrder must be an array" });
    }

    const updated = await Collection.findByIdAndUpdate(
      req.params.id,
      { questionOrder },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json({ message: "Question order updated successfully", collection: updated });
  } catch (error) {
    res.status(400).json({ message: "Failed to update question order", error: error.message });
  }
});

// Update game settings for a collection (UPDATED)
router.patch('/:id/game-settings', async (req, res) => {
  try {
    const { useGlobalSettings, customSettings } = req.body;
    
    // Validate customSettings if provided
    if (customSettings) {
      const validModes = ['default', 'random', 'rotating', 'rotating-reverse'];
      if (customSettings.gameMode && !validModes.includes(customSettings.gameMode)) {
        return res.status(400).json({ message: "Invalid game mode" });
      }
      
      if (customSettings.wrongAnswerPenalty !== undefined && customSettings.wrongAnswerPenalty < 0) {
        return res.status(400).json({ message: "Wrong answer penalty must be positive" });
      }
      
      if (customSettings.hintPenalty !== undefined && customSettings.hintPenalty < 0) {
        return res.status(400).json({ message: "Hint penalty must be positive" });
      }
      
      if (customSettings.skipPenalty !== undefined && customSettings.skipPenalty < 0) {
        return res.status(400).json({ message: "Skip penalty must be positive" });
      }
    }

    const updateData = {
      useGlobalSettings: useGlobalSettings !== undefined ? useGlobalSettings : true,
      customSettings: useGlobalSettings ? null : customSettings
    };

    const updated = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json({ message: "Game settings updated successfully", collection: updated });
  } catch (error) {
    res.status(400).json({ message: "Failed to update game settings", error: error.message });
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