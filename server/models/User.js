
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },

    // Master Key encrypted with Password
    encryptedMasterKey: { type: String, required: true },
    masterKeyIV: { type: String, required: true },
    masterKeyAuthTag: { type: String, required: true }, // Added

    // Master Key encrypted with Recovery Code
    recoveryKeyEncrypted: { type: String, required: true },
    recoveryKeyIV: { type: String, required: true },
    recoveryKeyAuthTag: { type: String, required: true }, // Added

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
