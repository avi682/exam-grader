
import { API_BASE_URL } from '../config';

export function Login() {
    const [formData, setFormData] = useState({ phoneNumber: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            // Important: We attach the raw password to the user memory object
            // This acts as the 'Encryption Secret' for the session.
            login({ ...data, encryptionSecret: formData.password });

            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>כניסה למערכת</h2>
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
                <button type="submit" className="btn">התחבר</button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p>אין לך חשבון? <Link to="/register">הירשם כאן</Link></p>
                <p><Link to="/recover" style={{ color: '#64748b', fontSize: '0.9rem' }}>שכחתי סיסמה</Link></p>
            </div>
        </div>
    );
}
