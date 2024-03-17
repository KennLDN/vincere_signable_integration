const mongoose = require('mongoose');

const comliancyLogsSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    entityId: {
        type: Number,
        required: true
    },
    compliantStatus: {
        type: String,
        required: true,
        enum: ['yes', 'no', 'null']
    },
    changeTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('CompliancyLogs', comliancyLogsSchema);
