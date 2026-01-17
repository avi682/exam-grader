
import React, { useCallback, useState } from 'react';

export function UploadSection({ onFilesSelected, isGrading }) {
    const [files, setFiles] = useState({
        exam: null,
        rubric: null,
        submissions: []
    });

    const handleFileChange = (type, e) => {
        if (type === 'submissions') {
            setFiles(prev => ({ ...prev, [type]: Array.from(e.target.files) }));
        } else {
            setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
        }
    };

    const handleSubmit = () => {
        onFilesSelected(files);
    };

    const isReady = files.exam && files.rubric && files.submissions.length > 0;

    return (
        <div className="card">
            <h2>📄 העלאת קבצים</h2>
            <div className="upload-grid">
                <div className="upload-zone">
                    <h3>1. שאלון המבחן</h3>
                    <p className="text-dim">PDF או טקסט</p>
                    <input type="file" onChange={(e) => handleFileChange('exam', e)} accept=".pdf,.txt,.md" />
                </div>

                <div className="upload-zone">
                    <h3>2. מחוון (Rubric)</h3>
                    <p className="text-dim">הוראות בדיקה וניקוד</p>
                    <input type="file" onChange={(e) => handleFileChange('rubric', e)} accept=".pdf,.txt,.md" />
                </div>

                <div className="upload-zone">
                    <h3>3. מבחני תלמידים</h3>
                    <p className="text-dim">בחרו קובץ אחד או יותר</p>
                    <input type="file" multiple onChange={(e) => handleFileChange('submissions', e)} accept=".pdf,.txt,.md" />
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <button
                    className="btn"
                    disabled={!isReady || isGrading}
                    onClick={handleSubmit}
                >
                    {isGrading ? 'בודק מבחנים...' : 'מנתח מבחנים 🚀'}
                </button>
            </div>
        </div>
    );
}
