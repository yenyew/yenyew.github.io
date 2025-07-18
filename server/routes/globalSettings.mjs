import express from "express";
import GlobalSettings from "../models/globalSettingsdb.mjs";

const router = express.Router();

// Get global settings (create default if doesn't exist)
router.get('/', async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await GlobalSettings.create({
        defaultGameMode: 'default',
        defaultWrongAnswerPenalty: 300,
        defaultHintPenalty: 120,
        defaultSkipPenalty: 600
      });
    }
    
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch global settings", error: error.message });
  }
});

// Update global settings
router.patch('/', async (req, res) => {
  try {
    const { defaultGameMode, defaultWrongAnswerPenalty, defaultHintPenalty, defaultSkipPenalty } = req.body;
    
    // Validate game mode
    const validModes = ['default', 'random', 'rotating', 'rotating-reverse'];
    if (defaultGameMode && !validModes.includes(defaultGameMode)) {
      return res.status(400).json({ message: "Invalid game mode" });
    }
    
    // Validate penalties are positive numbers
    if (defaultWrongAnswerPenalty !== undefined && defaultWrongAnswerPenalty < 0) {
      return res.status(400).json({ message: "Wrong answer penalty must be positive" });
    }
    if (defaultHintPenalty !== undefined && defaultHintPenalty < 0) {
      return res.status(400).json({ message: "Hint penalty must be positive" });
    }
    if (defaultSkipPenalty !== undefined && defaultSkipPenalty < 0) {
      return res.status(400).json({ message: "Skip penalty must be positive" });
    }
    
    // Find existing settings or create new
    let settings = await GlobalSettings.findOne();
    
    if (!settings) {
      settings = new GlobalSettings();
    }
    
    // Update fields
    if (defaultGameMode !== undefined) settings.defaultGameMode = defaultGameMode;
    if (defaultWrongAnswerPenalty !== undefined) settings.defaultWrongAnswerPenalty = defaultWrongAnswerPenalty;
    if (defaultHintPenalty !== undefined) settings.defaultHintPenalty = defaultHintPenalty;
    if (defaultSkipPenalty !== undefined) settings.defaultSkipPenalty = defaultSkipPenalty;
    
    await settings.save();
    
    res.status(200).json({ message: "Global settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to update global settings", error: error.message });
  }
});

export default router;