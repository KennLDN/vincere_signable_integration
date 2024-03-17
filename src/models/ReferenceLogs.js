const mongoose = require('mongoose');

// -1 = errored, 0 = not processed, 1 = processing, 2 = signed/read

const referenceLogsSchema = new mongoose.Schema({
  entityId: {
    type: Number,
    required: true,
  },
  oneStatus: {
    type: Number,
    enum: [-1, 0, 1, 2],
    default: 0,
  },
  twoStatus: {
    type: Number,
    enum: [-1, 0, 1, 2],
    default: 0,
  },
  threeStatus: {
    type: Number,
    enum: [-1, 0, 1, 2],
    default: 0,
  },
  oneUser: {
    type: Number,
    default: null,
  },
  twoUser: {
    type: Number,
    default: null,
  },
  threeUser: {
    type: Number,
    default: null,
  },
  oneFingerprint: {
    type: String,
    default: null,
  },
  twoFingerprint: {
    type: String,
    default: null,
  },
  threeFingerprint: {
    type: String,
    default: null,
  },
  oneDate: {
    type: Date,
    default: null,
  },
  twoDate: {
    type: Date,
    default: null,
  },
  threeDate: {
    type: Date,
    default: null,
  },
  oneMsg: {
    type: String,
    default: null,
  },
  twoMsg: {
    type: String,
    default: null,
  },
  threeMsg: {
    type: String,
    default: null,
  }
});

module.exports = mongoose.model('ReferenceLogs', referenceLogsSchema);