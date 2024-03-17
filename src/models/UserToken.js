const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    idToken: { type: String, required: true },
    ipAddress: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

userTokenSchema.index({ "created_at": 1 }, { expireAfterSeconds: 3540 });

module.exports = mongoose.model('UserToken', userTokenSchema);
