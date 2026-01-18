
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResultsTable } from '../components/ResultsTable';
import { API_BASE_URL } from '../config';

export function History() {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // IMPORTANT: We send the encryption secret (password) to decrypt on server
                // Ideally we decrypt on client, but for this phase we use the server-side decrypt flow.
                const headers = {
                    'Authorization': `Bearer ${user.token}`
                };

                // Add secret only if ephemeral session has it (it should immediately after login)
                if (user.encryptionSecret) {
                    headers['X-Encryption-Secret'] = user.encryptionSecret;
                } else {
                    // Fallback: This happens if user refreshed page (lost secret from memory).
                    // In a real app we'd ask them to re-enter password to unlock history.
                    // For now, let's gracefully fail or show empty.
                    console.warn("No encryption secret found in memory - history locked.");
                    setLoading(false);
                    return;
                }



                const res = await fetch(`${API_BASE_URL}/api/history`, { headers });
                const data = await res.json();

                if (Array.isArray(data)) {
                    setExams(data);
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (loading) return <div className="text-center p-8">טוען היסטוריה...</div>;

    if (!user.encryptionSecret) {
        return (
            <div className="card text-center">
                <h3>🔒 היסטוריה נעולה</h3>
                <p>מטעמי אבטחה, עליך להתחבר מחדש כדי לפתוח את ההצפנה ולצפות בהיסטוריה.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>היסטוריית מבחנים 📚</h1>

            <div className="card">
                {exams.length === 0 ? (
                    <p>לא נמצאו מבחנים.</p>
                ) : (
                    <div className="grid gap-4">
                        {exams.map(exam => (
                            <div
                                key={exam.id}
                                className="p-4 border rounded hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                                onClick={() => setSelectedExam(exam)}
                                style={{ border: selectedExam?.id === exam.id ? '2px solid #4F46E5' : '1px solid #e2e8f0' }}
                            >
                                <div>
                                    <h3 style={{ margin: 0 }}>{exam.name}</h3>
                                    <span className="text-dim text-sm">{new Date(exam.date).toLocaleString()}</span>
                                </div>
                                <div>
                                    {exam.error ?
                                        <span className="badge badge-warning">שגיאת פענוח</span> :
                                        <span className="badge badge-success">נפתח בהצלחה</span>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedExam && !selectedExam.error && (
                <div style={{ marginTop: '2rem' }}>
                    <h2>תוצאות עבור: {selectedExam.name}</h2>
                    <ResultsTable results={selectedExam.data} />
                </div>
            )}
        </div>
    );
}
