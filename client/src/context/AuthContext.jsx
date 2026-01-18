
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from local storage on startup
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // userData includes { token, _id, phoneNumber, ... }
        // We also need to store the password (or derived key) temporarily for this session 
        // to enable "Zero Knowledge" encryption/decryption on the server.
        // SECURITY NOTE: Storing password in memory is standard for session-based encryption. 
        // We will NOT store it in localStorage for security (it vanishes on refresh/close),
        // requiring re-login is safer, OR we store it in memory.
        // For better UX during "Pet Project" dev, we might verify if user wants to persist.
        // Let's store sensitive 'encryptionSecret' ONLY in memory (state), not localStorage.

        // userData from API response: { token, _id, phoneNumber }
        // We need to merge with the password used during login form submission

        setUser(userData);
        // We don't save ephemeral secrets to localStorage
        localStorage.setItem('user', JSON.stringify({
            token: userData.token,
            _id: userData._id,
            phoneNumber: userData.phoneNumber
        }));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
