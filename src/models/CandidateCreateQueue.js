const mongoose = require('mongoose');

const candidateCreateQueueSchema = new mongoose.Schema({
  entityId: { type: Number, required: true },
  userId: { type: Number, required: true },
  timestamp: { type: Date, required: true } 
}, { timestamps: false });

module.exports = mongoose.model('CandidateCreateQueue', candidateCreateQueueSchema, 'candidateCreateQueue');
