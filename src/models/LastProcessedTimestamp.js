const mongoose = require('mongoose');

const lastProcessedTimestampSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true }
});

module.exports = mongoose.model('LastProcessedTimestamp', lastProcessedTimestampSchema);
