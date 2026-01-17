
import React from 'react';

export function ResultsTable({ results, excelFile }) {
    if (!results || results.length === 0) return null;

    const downloadExcel = () => {
        if (!excelFile) return;
        const link = document.createElement('a');
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelFile}`;
        link.download = 'exam_grades.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get all unique question IDs for headers
    const questionIds = Array.from(new Set(
        results.flatMap(r => r.questions ? r.questions.map(q => q.questionId) : [])
    )).sort();

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>📊 תוצאות הבדיקה</h2>
                <button className="btn" onClick={downloadExcel}> הורד אקסל 📥</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>שם התלמיד</th>
                            <th>ציון סופי</th>
                            {questionIds.map(qid => (
                                <th key={qid}>שאלה {qid}</th>
                            ))}
                            <th>הערות מערכת</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((student, idx) => {
                            const lowConfidence = student.questions?.some(q => q.confidence < 95);

                            return (
                                <tr key={idx} style={{ backgroundColor: lowConfidence ? '#fff7ed' : 'transparent' }}>
                                    <td>{student.studentName}</td>
                                    <td><strong>{student.totalScore}</strong></td>
                                    {questionIds.map(qid => {
                                        const q = student.questions?.find(sq => sq.questionId === qid);
                                        return (
                                            <td key={qid}>
                                                {q ? (
                                                    <div>
                                                        <span>{q.score}</span>
                                                        {q.confidence < 95 && (
                                                            <span title={q.uncertaintyReason} style={{ marginLeft: '5px', cursor: 'help' }}>⚠️</span>
                                                        )}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        );
                                    })}
                                    <td>
                                        {lowConfidence ?
                                            <span className="badge badge-warning">נדרשת בדיקה ידנית</span> :
                                            <span className="badge badge-success">תקין</span>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
