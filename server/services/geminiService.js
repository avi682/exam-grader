
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function gradeExam(examText, rubricText, studentAnswerText) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    You are an expert automated exam grader. 
    Your task is to grade a student's submission based on the provided Exam Questions and Grading Rubric.
    
    Context:
    ---
    EXAM QUESTIONS:
    ${examText}
    ---
    GRADING RUBRIC:
    ${rubricText}
    ---
    STUDENT SUBMISSION:
    ${studentAnswerText}
    ---

    Instructions:
    1. For each question identified in the exam/rubric, evaluate the student's answer.
    2. Assign a score based strictly on the rubric.
    3. Determine a "confidence" score (0-100) for your grading of that specific question.
       - If the student's handwriting (OCR text) is ambiguous, or the answer is vague and you are guessing, lower the confidence.
       - If the answer clearly matches or misses the rubric, confidence should be high (95-100).
    4. Provide a brief comment explaining the deduction or full points.
    5. If confidence is below 95, explicitly state EXACTLY what part is uncertain (Question X, Section Y).

    Output Format:
    Return ONLY valid JSON with this structure:
    {
        "questions": [
            {
                "questionId": "1a",
                "score": 5,
                "maxScore": 5,
                "confidence": 100,
                "comment": "Correctly identified X",
                "uncertaintyReason": null 
            },
            {
                "questionId": "1b",
                "score": 2,
                "maxScore": 5,
                "confidence": 80,
                "comment": "Partial credit.",
                "uncertaintyReason": "Student answer text is garbled, unclear if they meant 'photosynthesis' or 'photography'."
            }
        ],
        "totalScore": 7,
        "totalMaxScore": 10
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini Grading Error:", error);
        return {
            questions: [],
            totalScore: 0,
            totalMaxScore: 0,
            error: "Failed to grade submission."
        };
    }
}

module.exports = { gradeExam };
