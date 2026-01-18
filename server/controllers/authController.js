
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { encrypt, decrypt, generateMasterKey, deriveKey } = require('../utils/cryptoUtils');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_dev_key', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!phoneNumber || !password) {
            return res.status(400).json({ message: 'Please include all fields' });
        }

        const userExists = await User.findOne({ phoneNumber });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 1. Password Hash for Auth
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Generate Master Key (The key to the vault)
        const masterKey = generateMasterKey(); // Buffer

        // 3. Encrypt Master Key with Password
        const passwordDerivedKey = deriveKey(password, 'salt_fixed_for_simplicity');
        const encMasterPassword = encrypt(masterKey.toString('hex'), passwordDerivedKey);

        // 4. Generate Recovery Code
        const recoveryCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars

        // 5. Encrypt Master Key with Recovery Code
        const recoveryDerivedKey = deriveKey(recoveryCode, 'recovery_salt');
        const encMasterRecovery = encrypt(masterKey.toString('hex'), recoveryDerivedKey);

        // Save User
        const user = await User.create({
            phoneNumber,
            passwordHash,

            encryptedMasterKey: encMasterPassword.encryptedData,
            masterKeyIV: encMasterPassword.iv,
            masterKeyAuthTag: encMasterPassword.authTag,

            recoveryKeyEncrypted: encMasterRecovery.encryptedData,
            recoveryKeyIV: encMasterRecovery.iv,
            recoveryKeyAuthTag: encMasterRecovery.authTag
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id),
                recoveryCode: recoveryCode,
                message: "Registration successful"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const loginUser = async (req, res) => {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
        res.json({
            _id: user._id,
            phoneNumber: user.phoneNumber,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

const recoverPassword = async (req, res) => {
    const { phoneNumber, recoveryCode, newPassword } = req.body;

    try {
        const user = await User.findOne({ phoneNumber });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Unlock Master Key using Recovery Code
        const recoveryDerivedKey = deriveKey(recoveryCode, 'recovery_salt');

        let masterKeyHex;
        try {
            masterKeyHex = decrypt(
                user.recoveryKeyEncrypted,
                recoveryDerivedKey,
                user.recoveryKeyIV,
                user.recoveryKeyAuthTag
            );
        } catch (e) {
            return res.status(401).json({ message: 'Invalid Recovery Code' });
        }

        // 2. Set new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // 3. Re-encrypt Master Key with NEW Password
        const passwordDerivedKey = deriveKey(newPassword, 'salt_fixed_for_simplicity');
        const encMasterPassword = encrypt(masterKeyHex, passwordDerivedKey);

        // 4. Update User
        user.passwordHash = passwordHash;
        user.encryptedMasterKey = encMasterPassword.encryptedData;
        user.masterKeyIV = encMasterPassword.iv;
        user.masterKeyAuthTag = encMasterPassword.authTag;

        await user.save();

        res.json({ message: "Password reset successful. You can now login." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during recovery' });
    }
};

module.exports = { registerUser, loginUser, recoverPassword };
