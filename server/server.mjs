import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import players from './routes/players.mjs';
import admins from './routes/admins.mjs';
import questions from './routes/questions.mjs';
import collections from './routes/collections.mjs';
import photoUpload from './routes/photoUpload.mjs';
import autoClearRoutes from './routes/autoClear.mjs'; 
import AutoClearConfig from './models/autoCleardb.mjs'; 
import Player from './models/playerdb.mjs'; 
import BadUsername from './routes/badUsername.mjs';

dotenv.config();

const PORT = process.env.PORT || 2000;
const DB_CONNECT = process.env.DB_CONNECT;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/players", players);
app.use("/admins", admins);
app.use("/questions", questions);
app.use("/collections", collections);
app.use("/upload-photo", photoUpload);
app.use("/auto-clear-config", autoClearRoutes);
app.use("/bad-usernames", BadUsername);

// MongoDB connection
mongoose.set('strictQuery', true);
mongoose.connect(DB_CONNECT)
  .then(() => {
    console.log('MongoDB connected...');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Test route
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});

setInterval(async () => {
  try {
    const config = await AutoClearConfig.findOne();
    if (!config) return;

    const now = new Date();
    const last = config.lastClearedAt || new Date(0);
    let due = false;

    if (config.interval === "day") {
      due = now - last >= 10 * 1000; // 1 seconds instead of 24 hours (testing purpose)
    } else if (config.interval === "week") {
      due = now - last >= 7 * 24 * 60 * 60 * 1000;
    } else if (config.interval === "month") {
      due = now - last >= 30 * 24 * 60 * 60 * 1000;
    }

    if (!due) return;

    let filter = {};
    if (config.target === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.finishedAt = { $gte: start, $lte: end };

    } else if (config.target === "week") {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay()); // Sunday
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      filter.finishedAt = { $gte: start, $lte: end };

    } else if (config.target === "month") {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // last day of the previous month
      end.setHours(23, 59, 59, 999);

      filter.finishedAt = { $gte: start, $lte: end };

    } else if (config.target === "custom") {
      if (!config.startDate || !config.endDate) return;

      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      end.setHours(23, 59, 59, 999);

      filter.finishedAt = { $gte: start, $lte: end };

    } else {
      // "all"
      filter.finishedAt = { $lte: new Date() };
    }


    const result = await Player.deleteMany(filter);
    config.lastClearedAt = now;
    await config.save();

    console.log(`[AUTO CLEAR] Deleted ${result.deletedCount} players (Target: ${config.target})`);
  } catch (err) {
    console.error("[AUTO CLEAR ERROR]", err);
  }
}, 10 * 1000); 