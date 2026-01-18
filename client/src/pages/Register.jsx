
import { API_BASE_URL } from '../config';

export function Register() {
    const [formData, setFormData] = useState({ phoneNumber: '', password: '' });
    const [error, setError] = useState('');
    const [recoveryCode, setRecoveryCode] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            // Show Recovery Code before redirecting
            setRecoveryCode(data.recoveryCode);

            // Login in background but wait for user to acknowledge code
            login({ ...data, encryptionSecret: formData.password });

        } catch (err) {
            setError(err.message);
        }
    };

    if (recoveryCode) {
        return (
            <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', border: '2px solid #ef4444' }}>
                <h2 style={{ color: '#ef4444' }}>⚠️ שמור את קוד השחזור!</h2>
                <p>מכיוון שהמערכת מאובטחת בהצפנה מקצה-לקצה, <strong>לא נוכל לשחזר את הסיסמה שלך</strong> ללא הקוד הזה.</p>

                <div style={{
                    background: '#f1f5f9',
                    padding: '1.5rem',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    letterSpacing: '5px',
                    margin: '1.5rem 0',
                    fontFamily: 'monospace',
                    userSelect: 'all'
                }}>
                    {recoveryCode}
                </div>

                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>העתק את הקוד ושמור אותו במקום בטוח.</p>

                <button className="btn" onClick={() => navigate('/')} style={{ width: '100%' }}>
                    העתקתי ושמרתי, כנס למערכת &gt;
                </button>
            </div>
        );
    }

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>הרשמה למערכת</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label>מספר טלפון:</label>
                    <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                        required
                    />
                </div>
                <div>
                    <label>סיסמה:</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                        required
                    />
                </div>
                <button type="submit" className="btn">הירשם</button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p>כבר יש לך חשבון? <Link to="/login">התחבר כאן</Link></p>
            </div>
        </div>
    );
}
