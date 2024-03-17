const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  id_token: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Token', TokenSchema);
