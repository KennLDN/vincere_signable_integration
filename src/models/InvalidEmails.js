const mongoose = require('mongoose');

const invalidEmailsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InvalidEmails', invalidEmailsSchema);
