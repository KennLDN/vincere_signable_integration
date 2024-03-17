const mongoose = require('mongoose');

const candidateCompliancySchema = new mongoose.Schema({
    candidateId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    compliant: {
        type: String,
        required: true,
        enum: ['yes', 'no', 'null'] 
    }
}, { timestamps: true });

module.exports = mongoose.model('CandidateCompliancy', candidateCompliancySchema);
