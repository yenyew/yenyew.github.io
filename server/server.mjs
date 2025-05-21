import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import players from './routes/players.mjs';
import admins from './routes/admins.mjs';
import questions from './routes/questions.mjs';


dotenv.config();

const PORT = process.env.PORT || 2000;
const DB_CONNECT = process.env.DB_CONNECT;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/players", players);
app.use("/admins", admins);
app.use("/questions", questions);

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(DB_CONNECT)
  .then(() => {
    console.log('MongoDB connected...');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
