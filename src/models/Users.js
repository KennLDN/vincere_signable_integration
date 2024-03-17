const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  id: { type: Number, required: true, unique: true },
  full_name: { type: String, required: true },
  signable_id: { type: Number, required: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
