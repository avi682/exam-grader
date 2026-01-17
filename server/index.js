
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { gradeExam } = require('./services/geminiService');
const { extractText } = require('./services/fileProcessor');
const { generateExcel } = require('./services/excelGenerator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/api/grade', upload.fields([
    { name: 'exam', maxCount: 1 },
    { name: 'rubric', maxCount: 1 },
    { name: 'submissions', maxCount: 50 } // Allow multiple submissions
]), async (req, res) => {
    try {
        const examFile = req.files['exam'] ? req.files['exam'][0] : null;
        const rubricFile = req.files['rubric'] ? req.files['rubric'][0] : null;
        const submissionFiles = req.files['submissions'] || [];

        if (!examFile || !rubricFile || submissionFiles.length === 0) {
            return res.status(400).json({ error: 'Missing required files (exam, rubric, or submissions)' });
        }

        // 1. Extract text from Exam and Rubric
        const examText = await extractText(examFile);
        const rubricText = await extractText(rubricFile);

        const results = [];

        // 2. Process each submission
        for (const submissionFile of submissionFiles) {
            const studentText = await extractText(submissionFile);
            const studentName = submissionFile.originalname.replace(path.extname(submissionFile.originalname), '');
            
            // 3. Grade using Gemini
            const gradeResult = await gradeExam(examText, rubricText, studentText);
            
            results.push({
                studentName,
                ...gradeResult
            });
        }

        // 4. Generate Excel
        const excelBuffer = generateExcel(results);

        // Cleanup uploaded files
        [examFile, rubricFile, ...submissionFiles].forEach(file => {
           if(file && file.path) fs.unlinkSync(file.path);
        });

        // 5. Build response
        // Convert buffer to base64 to send as JSON or send file directly?
        // Let's send JSON with data and maybe a link or base64 excel if needed immediately, 
        // OR just send the JSON data for the frontend table and let frontend request excel download or generate it.
        // The requirement says "return grades in excel table", implying the output IS the excel or the UI shows it.
        // Let's return the JSON data for the UI to display, and a base64 of the excel to download.
        
        res.json({
            results,
            excelFile: excelBuffer.toString('base64')
        });

    } catch (error) {
        console.error('Error processing exam:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
