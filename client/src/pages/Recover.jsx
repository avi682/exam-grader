
import { API_BASE_URL } from '../config';

export function Recover() {
    const [formData, setFormData] = useState({ phoneNumber: '', recoveryCode: '', newPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/recover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setSuccess('הסיסמה שוחזרה בהצלחה! מעביר להתחברות...');
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>שחזור סיסמה</h2>
            <p className="text-dim" style={{ marginBottom: '1rem' }}>הזן את קוד השחזור שקיבלת בעת ההרשמה.</p>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}

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
                    <label>קוד שחזור (Recovery Code):</label>
                    <input
                        type="text"
                        value={formData.recoveryCode}
                        onChange={e => setFormData({ ...formData, recoveryCode: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', fontFamily: 'monospace' }}
                        required
                    />
                </div>
                <div>
                    <label>סיסמה חדשה:</label>
                    <input
                        type="password"
                        value={formData.newPassword}
                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                        required
                    />
                </div>
                <button type="submit" className="btn">שחזר סיסמה</button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p><Link to="/login">חזרה להתחברות</Link></p>
            </div>
        </div>
    );
}
