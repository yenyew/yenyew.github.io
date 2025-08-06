import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["main", "admin"],
    default: "admin",
  },

  resetToken: {
  type: String,
  default: null,
},
resetTokenExpiry: {
  type: Date,
  default: null,
}

}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});

const Admin = model('Admin', AdminSchema);
export default Admin;
