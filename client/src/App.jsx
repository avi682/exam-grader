
import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Recover } from './pages/Recover';
import { History } from './pages/History';
import { UploadSection } from './components/UploadSection';
import { ResultsTable } from './components/ResultsTable';
import { API_BASE_URL } from './config';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function MainGrader() {
  const [results, setResults] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleGrade = async (data) => {
    setIsGrading(true);
    setError(null);
    setResults(null);
    setExcelFile(null);

    const formData = new FormData();
    if (data.exam) formData.append('exam', data.exam);

    // Rubric Text
    formData.append('rubricText', data.rubricText);

    if (data.submissions && data.submissions.length > 0) {
      Array.from(data.submissions).forEach(file => {
        formData.append('submissions', file);
      });
    }

    // SECURE Encryption: Pass the secret
    // Note: For 'Zero Knowledge' this should ideally perform encryption on client.
    // But since grading is server-side, we pass the key to server securely.
    if (user.encryptionSecret) {
      formData.append('encryptionSecret', user.encryptionSecret);
    }

    try {
      const token = user?.token;
      const response = await fetch(`${API_BASE_URL}/api/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Content-Type' is set automatically by fetch when using FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to grade');
      }

      const resultData = await response.json();
      setResults(resultData.results);
      setExcelFile(resultData.excelFile);

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="container">
      <h1>🤖 בודק המבחנים האוטומטי (Gemini Pro)</h1>

      <UploadSection onFilesSelected={handleGrade} isGrading={isGrading} />

      {isGrading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ fontSize: '3rem' }}>🧠</div>
          <h3>הבינה המלאכותית בודקת את המבחנים...</h3>
          <p>זה יכול לקחת דקה או שתיים (כתב יד, OCR, והסקת מסקנות)</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderRight: '4px solid red' }}>
          <h3 style={{ color: 'red' }}>שגיאה</h3>
          <p>{error}</p>
        </div>
      )}

      <ResultsTable results={results} excelFile={excelFile} />
    </div>
  );
}

function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav style={{ background: '#fff', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
        <div style={{ fontWeight: 'bold' }}>שלום, {user.phoneNumber} 👋</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" className="btn" style={{ background: location.pathname === '/' ? '#e0e7ff' : 'transparent', color: 'black' }}>ראשי</Link>
          <Link to="/history" className="btn" style={{ background: location.pathname === '/history' ? '#e0e7ff' : 'transparent', color: 'black' }}>היסטוריה</Link>
          <button onClick={logout} className="btn" style={{ background: '#fee2e2', color: '#991b1b' }}>התנתק</button>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="app-layout">
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover" element={<Recover />} />
        <Route path="/" element={
          <PrivateRoute>
            <MainGrader />
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}
