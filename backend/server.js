const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const otplib = require('otplib');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// DB Connection
const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
});

// --- Database Initialization ---
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                type VARCHAR(10) NOT NULL,
                category VARCHAR(50) NOT NULL,
                amount TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully.");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
};

initDb();

// --- 암호화 로직 (AES-256-GCM) ---
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(cipherText) {
    try {
        const [ivHex, authTagHex, encryptedHex] = cipherText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error("Decryption failed:", e);
        return "Decryption Error";
    }
}

// --- Auth API ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Simple authentication for demo
    if (username === 'admin_user' && password === 'secure_password_123') {
        res.json({ success: true, message: "Login success. Proceed to MFA." });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials." });
    }
});

app.post('/api/auth/mfa-verify', (req, res) => {
    const { token } = req.body;
    const isValid = otplib.authenticator.check(token, process.env.MFA_SECRET);
    if (isValid) {
        res.json({ success: true, message: "관리자 인증 성공" });
    } else {
        res.status(401).json({ success: false, message: "잘못된 인증 번호입니다." });
    }
});

// --- 가계부 데이터 CRUD ---
app.post('/api/transactions', async (req, res) => {
    const { date, type, category, amount, desc } = req.body;

    const encryptedAmount = encrypt(amount.toString());
    const encryptedDesc = encrypt(desc || '');

    try {
        const result = await pool.query(
            'INSERT INTO transactions (date, type, category, amount, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [date, type, category, encryptedAmount, encryptedDesc]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
        const decryptedData = result.rows.map(row => ({
            ...row,
            amount: parseFloat(decrypt(row.amount)),
            description: decrypt(row.description)
        }));
        res.json(decryptedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend Security Service running on port ${PORT}`));
