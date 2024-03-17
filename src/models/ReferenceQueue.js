const mongoose = require('mongoose');

const referenceQueueSchema = new mongoose.Schema({
    entityId: {
        type: Number,
        required: true,
    },
    userId: {
        type: Number,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['SCHL', 'CHAR', 'PROF'],
    },
    index: {
        type: Number,
        required: true,
        enum: [1, 2, 3],
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReferenceQueue', referenceQueueSchema);
