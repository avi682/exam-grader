
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examName: {
        type: String,
        required: true
    },
    // The entire result JSON object, encrypted as a single string
    encryptedData: {
        type: String,
        required: true
    },
    // IV used for this specific record's encryption
    iv: {
        type: String,
        required: true
    },
    // Auth Tag for GCM verification
    authTag: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
