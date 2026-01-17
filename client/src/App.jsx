
import React, { useState } from 'react';
import { UploadSection } from './components/UploadSection';
import { ResultsTable } from './components/ResultsTable';

function App() {
  const [results, setResults] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState(null);

  const handleGrade = async (files) => {
    setIsGrading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('exam', files.exam);
    formData.append('rubric', files.rubric);
    files.submissions.forEach(file => {
      formData.append('submissions', file);
    });

    try {
      const response = await fetch('http://localhost:3000/api/grade', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results);
      setExcelFile(data.excelFile);
    } catch (err) {
      console.error(err);
      setError('שגיאה בתהליך הבדיקה. וודא שהשרת רץ ושכל הקבצים תקינים.');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Exam Grader 🤖</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#64748b' }}>
        מערכת אוטומטית לבדיקת מבחנים עם זיהוי רמת ביטחון
      </p>

      <UploadSection onFilesSelected={handleGrade} isGrading={isGrading} />

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <ResultsTable results={results} excelFile={excelFile} />
    </div>
  );
}

export default App;
