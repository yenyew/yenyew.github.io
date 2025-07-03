import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectPhotosDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("PhotosDB connected!");
  } catch (error) {
    console.error("Error connecting to PhotosDB:", error);
  }
};

export default connectPhotosDB;
