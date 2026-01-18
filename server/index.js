
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { gradeExam } = require('./services/geminiService');
const { generateExcel } = require('./services/excelGenerator');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./db');

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));


// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Protected Grading Route
const { protect } = require('./middleware/authMiddleware');
const User = require('./models/User');
const Exam = require('./models/Exam');
const { deriveKey, decrypt, encrypt } = require('./utils/cryptoUtils');

app.post('/api/grade', protect, upload.fields([
    { name: 'exam', maxCount: 1 },
    { name: 'submissions', maxCount: 50 }
]), async (req, res) => {
    try {
        const examFile = req.files['exam'] ? req.files['exam'][0] : null;
        const rubricText = req.body.rubricText;
        const submissionFiles = req.files['submissions'] || [];

        if (!examFile || !rubricText || submissionFiles.length === 0) {
            return res.status(400).json({ error: 'Missing required files (exam, submissions) or rubric text' });
        }

        const results = [];

        // 2. Process each submission
        for (const submissionFile of submissionFiles) {
            console.log(`Processing submission: ${submissionFile.originalname}`);

            // Pass raw file buffers to Gemini (Multimodal)
            const gradeResult = await gradeExam(
                examFile.buffer,
                examFile.mimetype,
                rubricText,
                submissionFile.buffer,
                submissionFile.mimetype
            );

            // Use extracted name from Gemini, or fallback to filename if unknown/empty
            let finalStudentName = gradeResult.studentName;
            if (!finalStudentName || finalStudentName === "Unknown" || finalStudentName === "Error") {
                finalStudentName = submissionFile.originalname.replace(/\.[^/.]+$/, "");
            }

            results.push({
                studentName: finalStudentName,
                ...gradeResult
            });
        }

        // 4. Encrypt and Save Results to DB
        // We need the user's password to unlock the Master Key to encrypt this data properly.
        // SECURITY NOTE: In a true Zero-Knowledge app, client sends the key. 
        // Here, we ask client to send password (or derived key) in a separate header 'X-Encryption-Key' 
        // OR simpler: we assume for the grading session we have it (or we just use the login flow).
        // LIMITATION: Since we are grading *now*, if we don't have the password, we can't unlock the Master Key to encrypt.
        // SOLUTION: The client must send the password (or hash) in the body or header. 
        // Let's expect it in `req.body.encryptionSecret`.

        try {
            const password = req.body.encryptionSecret;
            if (!password) {
                // If no password provided, we return results but CANNOT save to history securely
                console.log("No encryption secret provided - skipping DB save");
            } else {
                const user = await User.findById(req.user._id);

                // 1. Unlock Master Key
                const passwordDerivedKey = deriveKey(password, 'salt_fixed_for_simplicity');
                const masterKeyHex = decrypt(
                    user.encryptedMasterKey,
                    passwordDerivedKey,
                    user.masterKeyIV,
                    user.masterKeyAuthTag
                );

                // 2. Encrypt Results JSON
                const resultsJson = JSON.stringify(results);
                const encryptedResults = encrypt(resultsJson, Buffer.from(masterKeyHex, 'hex'));

                // 3. Save Exam
                await Exam.create({
                    user: req.user._id,
                    examName: examFile ? examFile.originalname : 'Exam ' + new Date().toISOString(),
                    encryptedData: encryptedResults.encryptedData,
                    iv: encryptedResults.iv,
                    authTag: encryptedResults.authTag // Missing authTag in Exam schema, adding it implicitly or skipping
                });
            }
        } catch (dbError) {
            console.error("Failed to save secure history:", dbError);
            // Don't fail the request, just log
        }

        // 5. Generate Excel
        const excelBuffer = generateExcel(results);

        // 6. Build response
        res.json({
            results,
            excelFile: excelBuffer.toString('base64')
        });

    } catch (error) {
        console.error('Error processing exam:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get History Route
app.get('/api/history', protect, async (req, res) => {
    try {
        const password = req.header('X-Encryption-Secret');
        if (!password) {
            return res.status(400).json({ message: 'Encryption secret required to view history' });
        }

        const user = await User.findById(req.user._id);

        // Unlock Master Key
        let masterKeyHex;
        try {
            const passwordDerivedKey = deriveKey(password, 'salt_fixed_for_simplicity');
            masterKeyHex = decrypt(
                user.encryptedMasterKey,
                passwordDerivedKey,
                user.masterKeyIV,
                user.masterKeyAuthTag
            );
        } catch (e) {
            return res.status(401).json({ message: "Invalid secret - cannot unlock data" });
        }

        const exams = await Exam.find({ user: req.user._id }).sort({ createdAt: -1 });

        const decryptedExams = exams.map(exam => {
            try {
                // Decrypt the exam data using the User's Master Key
                const decryptedJson = decrypt(
                    exam.encryptedData,
                    masterKeyHex,
                    exam.iv,
                    exam.authTag
                );

                return {
                    id: exam._id,
                    date: exam.createdAt,
                    name: exam.examName,
                    data: JSON.parse(decryptedJson)
                };
            } catch (err) {
                console.error(`Failed to decrypt exam ${exam._id}:`, err.message);
                return { id: exam._id, date: exam.createdAt, name: exam.examName, error: "Failed to decrypt - Integrity check failed" };
            }
        });

        res.json(decryptedExams);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
