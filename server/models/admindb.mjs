import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["main", "admin"],
    default: "admin",
  }

}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});

const Admin = model('Admin', AdminSchema);
export default Admin;
