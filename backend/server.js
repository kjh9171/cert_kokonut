const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const otplib = require('otplib');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Multer 설정 (파일 업로드)
const upload = multer({ dest: 'uploads/' });

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
        // Transactions 테이블
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
        
        // Audit Logs 테이블 (감사 로그)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                action_type VARCHAR(50) NOT NULL,
                target_id INTEGER,
                admin_user VARCHAR(100) NOT NULL,
                reason TEXT,
                encrypted_snapshot TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

// --- Mock AI 분석 함수 ---
function generateAIAnalysis(transactions) {
    // 통계 계산
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
    
    // 카테고리별 지출 분석
    const expenseByCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
    
    const topExpenseCategory = Object.entries(expenseByCategory)
        .sort((a, b) => b[1] - a[1])[0];
    
    // AI 인사이트 생성 (Mock)
    const insights = {
        summary: `분석 기간 동안 총 수입은 ₩${income.toLocaleString('ko-KR')}이며, 총 지출은 ₩${expense.toLocaleString('ko-KR')}입니다. 순 저축액은 ₩${balance.toLocaleString('ko-KR')}이며, 저축률은 ${savingsRate}%입니다.`,
        
        keyMetrics: {
            totalIncome: income,
            totalExpense: expense,
            netSavings: balance,
            savingsRate: parseFloat(savingsRate),
            transactionCount: transactions.length
        },
        
        insights: [
            {
                type: savingsRate > 20 ? 'positive' : 'warning',
                title: savingsRate > 20 ? '우수한 저축률' : '저축률 개선 필요',
                message: savingsRate > 20 
                    ? `현재 저축률 ${savingsRate}%는 매우 양호한 수준입니다. 이 패턴을 유지하세요.`
                    : `현재 저축률 ${savingsRate}%는 개선이 필요합니다. 월 수입의 20% 이상 저축을 목표로 하세요.`
            },
            {
                type: 'info',
                title: '주요 지출 카테고리',
                message: topExpenseCategory 
                    ? `가장 큰 지출 항목은 '${topExpenseCategory[0]}'로 ₩${topExpenseCategory[1].toLocaleString('ko-KR')}입니다. 이 카테고리의 지출을 10% 줄이면 월 ₩${Math.floor(topExpenseCategory[1] * 0.1).toLocaleString('ko-KR')}를 추가 저축할 수 있습니다.`
                    : '지출 데이터가 충분하지 않습니다.'
            },
            {
                type: 'recommendation',
                title: '재무 건강 개선 제안',
                message: '비상금은 월 지출의 3-6개월분을 유지하는 것이 권장됩니다. 현재 월 평균 지출을 기준으로 약 ₩' + 
                    (expense * 3).toLocaleString('ko-KR') + ' ~ ₩' + (expense * 6).toLocaleString('ko-KR') + '의 비상금을 목표로 하세요.'
            }
        ],
        
        categoryBreakdown: Object.entries(expenseByCategory).map(([category, amount]) => ({
            category,
            amount,
            percentage: ((amount / expense) * 100).toFixed(1)
        })).sort((a, b) => b.amount - a.amount),
        
        timestamp: new Date().toISOString()
    };
    
    return insights;
}

// --- Auth API ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Simple authentication for demo
    if (username === 'admin' && password === '1234') {
        res.json({ success: true, message: "Login success. Proceed to MFA." });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials." });
    }
});

app.post('/api/auth/mfa-verify', (req, res) => {
    const { token } = req.body;
    // Demo: 123456 허용
    if (token === '123456') {
        res.json({ success: true, message: "관리자 인증 성공" });
    } else {
        res.status(401).json({ success: false, message: "잘못된 인증 번호입니다." });
    }
});

// --- 거래 데이터 CRUD ---

// 단일 거래 추가
app.post('/api/transactions', async (req, res) => {
    const { date, type, category, amount, description } = req.body;

    const encryptedAmount = encrypt(amount.toString());
    const encryptedDesc = encrypt(description || '');

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

// 모든 거래 조회 (복호화)
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

// CSV 파일 업로드
app.post('/api/transactions/upload-csv', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    
    try {
        // CSV 파일 읽기
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // 데이터 검증
                if (!data.date || !data.type || !data.category || !data.amount) {
                    errors.push({ row: data, error: 'Missing required fields' });
                    return;
                }
                
                results.push({
                    date: data.date,
                    type: data.type,
                    category: data.category,
                    amount: parseFloat(data.amount),
                    description: data.description || ''
                });
            })
            .on('end', async () => {
                // DB에 일괄 삽입
                let successCount = 0;
                
                for (const row of results) {
                    try {
                        const encryptedAmount = encrypt(row.amount.toString());
                        const encryptedDesc = encrypt(row.description);
                        
                        await pool.query(
                            'INSERT INTO transactions (date, type, category, amount, description) VALUES ($1, $2, $3, $4, $5)',
                            [row.date, row.type, row.category, encryptedAmount, encryptedDesc]
                        );
                        successCount++;
                    } catch (err) {
                        errors.push({ row, error: err.message });
                    }
                }
                
                // 임시 파일 삭제
                fs.unlinkSync(req.file.path);
                
                res.json({
                    success: true,
                    imported: successCount,
                    total: results.length,
                    errors: errors.length > 0 ? errors : undefined
                });
            })
            .on('error', (err) => {
                fs.unlinkSync(req.file.path);
                res.status(500).json({ error: 'CSV parsing failed: ' + err.message });
            });
    } catch (err) {
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
    }
});

// AI 재무 분석
app.post('/api/transactions/analyze', async (req, res) => {
    try {
        // 모든 거래 데이터 조회
        const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
        const decryptedData = result.rows.map(row => ({
            ...row,
            amount: parseFloat(decrypt(row.amount)),
            description: decrypt(row.description)
        }));
        
        // AI 분석 수행 (Mock)
        const analysis = generateAIAnalysis(decryptedData);
        
        res.json({
            success: true,
            analysis
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 거래 삭제 (감사 로그 기록)
app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { reason, adminUser } = req.body;
    
    try {
        // 삭제 전 데이터 조회 (감사 로그용)
        const targetResult = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
        
        if (targetResult.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        const targetData = targetResult.rows[0];
        
        // 스냅샷 암호화 (전체 레코드를 JSON으로 저장)
        const snapshot = JSON.stringify({
            id: targetData.id,
            date: targetData.date,
            type: targetData.type,
            category: targetData.category,
            amount: targetData.amount, // 이미 암호화된 상태
            description: targetData.description, // 이미 암호화된 상태
            created_at: targetData.created_at
        });
        const encryptedSnapshot = encrypt(snapshot);
        
        // 감사 로그 기록
        await pool.query(
            'INSERT INTO audit_logs (action_type, target_id, admin_user, reason, encrypted_snapshot) VALUES ($1, $2, $3, $4, $5)',
            ['DELETE', id, adminUser || 'admin', reason || 'No reason provided', encryptedSnapshot]
        );
        
        // 거래 삭제
        await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Transaction deleted and audit log recorded'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 감사 로그 조회
app.get('/api/audit-logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
        
        // 스냅샷 복호화 (선택적)
        const logs = result.rows.map(row => ({
            id: row.id,
            action_type: row.action_type,
            target_id: row.target_id,
            admin_user: row.admin_user,
            reason: row.reason,
            timestamp: row.timestamp,
            // 스냅샷은 보안상 기본적으로 복호화하지 않음
            has_snapshot: !!row.encrypted_snapshot
        }));
        
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 특정 감사 로그의 스냅샷 복호화 (관리자 전용)
app.get('/api/audit-logs/:id/snapshot', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('SELECT encrypted_snapshot FROM audit_logs WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Audit log not found' });
        }
        
        const encryptedSnapshot = result.rows[0].encrypted_snapshot;
        const decryptedSnapshot = decrypt(encryptedSnapshot);
        const snapshot = JSON.parse(decryptedSnapshot);
        
        // 스냅샷 내의 암호화된 필드도 복호화
        snapshot.amount = decrypt(snapshot.amount);
        snapshot.description = decrypt(snapshot.description);
        
        res.json({
            success: true,
            snapshot
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend Security Service running on port ${PORT}`));
