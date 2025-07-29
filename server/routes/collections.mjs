import express from 'express';
import Collection from '../models/collectiondb.mjs';
import Question from "../models/questionsdb.mjs";
import GlobalSettings from "../models/globalSettingsdb.mjs";

const router = express.Router();

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({}).lean();
    for (const col of collections) {
      col.questionCount = await Question.countDocuments({ collectionId: col._id });
    }
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all collections with their questions
router.get('/with-questions', async (req, res) => {
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

// Get public collection
router.get('/public', async (req, res) => {
  try {
    const publicCollection = await Collection.findOne({ isPublic: true, isOnline: true });
    if (!publicCollection) {
      return res.status(404).json({ message: "No public collection is currently available" });
    }
    res.status(200).json(publicCollection);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch public collection", error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch collection", error: error.message });
  }
});

// ✅ Add this route AFTER the one for /:id
router.get('/:id/questions', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('questionOrder');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    let questions;
    if (collection.questionOrder?.length) {
      questions = collection.questionOrder;
    } else {
      questions = await Question.find({ collectionId: collection._id });
    }

    res.status(200).json({
      collection: collection.name,
      code: collection.code,
      questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
  }
});


// Get collection by code (used in EnterCollCode)
router.get('/code/:code', async (req, res) => {
  try {
    const collection = await Collection.findOne({
      code: new RegExp(`^${req.params.code.trim()}$`, "i"),
      isOnline: true
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found or is offline" });
    }

    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch collection", error: error.message });
  }
});



// Get questions by collection code 
// router.get('/:code/questions', async (req, res) => {
//   try {
//     const collection = await Collection.findOne({
//       code: req.params.code,
//       isOnline: true
//     }).populate('questionOrder');

//     if (!collection) {
//       return res.status(404).json({ message: 'Collection not found or is offline' });
//     }

//     let questions;
//     if (collection.questionOrder?.length) {
//       questions = collection.questionOrder;
//     } else {
//       questions = await Question.find({ collectionId: collection._id });
//     }

//     res.status(200).json({
//       collection: collection.name,
//       code: collection.code,
//       questions
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
//   }
// });

// Get effective settings
router.get('/:id/effective-settings', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    let globalSettings = await GlobalSettings.findOne();
    if (!globalSettings) {
      globalSettings = await GlobalSettings.create({
        defaultGameMode: 'default',
        defaultWrongAnswerPenalty: 300,
        defaultHintPenalty: 120,
        defaultSkipPenalty: 600
      });
    }

    const effectiveSettings = collection.useGlobalSettings !== false
      ? {
          gameMode: globalSettings.defaultGameMode,
          wrongAnswerPenalty: globalSettings.defaultWrongAnswerPenalty,
          hintPenalty: globalSettings.defaultHintPenalty,
          skipPenalty: globalSettings.defaultSkipPenalty,
          usingGlobalSettings: true
        }
      : {
          gameMode: collection.customSettings?.gameMode || globalSettings.defaultGameMode,
          wrongAnswerPenalty: collection.customSettings?.wrongAnswerPenalty || globalSettings.defaultWrongAnswerPenalty,
          hintPenalty: collection.customSettings?.hintPenalty || globalSettings.defaultHintPenalty,
          skipPenalty: collection.customSettings?.skipPenalty || globalSettings.defaultSkipPenalty,
          usingGlobalSettings: false
        };

    res.status(200).json(effectiveSettings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get effective settings", error: error.message });
  }
});


// Create a new collection
router.post('/', async (req, res) => {
  try {
    const { name, code, questionOrder = [], gameMode = 'default', isPublic = false, isOnline = true } = req.body;

    const existing = await Collection.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Collection code must be unique" });
    }

    if (isPublic) {
      await Collection.updateMany({ isPublic: true }, { isPublic: false });
    }

    const newCollection = await Collection.create({ name, code, questionOrder, gameMode, isPublic, isOnline });
    res.status(201).json(newCollection);
  } catch (error) {
    res.status(400).json({ message: "Failed to create collection", error: error.message });
  }
});

// Update an existing collection
router.patch('/:id', async (req, res) => {
  try {
    const { name, code, questionOrder, gameMode, isPublic, isOnline } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (questionOrder) updateData.questionOrder = questionOrder;
    if (gameMode) updateData.gameMode = gameMode;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isOnline !== undefined) updateData.isOnline = isOnline;

    if (isPublic) {
      await Collection.updateMany({ isPublic: true, _id: { $ne: req.params.id } }, { isPublic: false });
    }

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

// Update question order
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

// Update game settings
router.patch('/:id/game-settings', async (req, res) => {
  try {
    const { useGlobalSettings, customSettings } = req.body;

    if (customSettings) {
      const validModes = ['default', 'random', 'rotating', 'rotating-reverse'];
      if (customSettings.gameMode && !validModes.includes(customSettings.gameMode)) {
        return res.status(400).json({ message: "Invalid game mode" });
      }
      if (customSettings.wrongAnswerPenalty < 0 || customSettings.hintPenalty < 0 || customSettings.skipPenalty < 0) {
        return res.status(400).json({ message: "Penalties must be positive numbers" });
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

// Delete collection
router.delete('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.isPublic) {
      return res.status(403).json({
        message: "Cannot delete a public collection. Set it offline instead."
      });
    }

    await Collection.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Collection deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete collection", error: error.message });
  }
});

export default router;
