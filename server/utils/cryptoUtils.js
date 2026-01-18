
const crypto = require('crypto');

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

// Generate a random master key
function generateMasterKey() {
    return crypto.randomBytes(KEY_LENGTH);
}

// Generate a derivation key from a password/secret using PBKDF2
function deriveKey(secret, salt) {
    return crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, 'sha256');
}

// Encrypt text (or JSON string)
function encrypt(text, masterKey) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

// Decrypt text
function decrypt(encryptedData, masterKey, ivHex, authTagHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = {
    generateMasterKey,
    deriveKey,
    encrypt,
    decrypt
};
