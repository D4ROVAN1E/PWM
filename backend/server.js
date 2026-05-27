require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Настройка подключения к PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'crypto_passwords',
    password: process.env.DB_PASSWORD || '123',
    port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';
const TOKEN_EXPIRES_IN = '1h'; // Ограниченный по времени токен

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Отсутствует токен доступа' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Токен истек или недействителен' });
        req.user = user;
        next();
    });
};

// --- AUTH ENDPOINTS ---

// 1. Запрос соли пользователя (нужно для хэширования на клиенте перед логином)
app.get('/api/auth/salt/:username', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT salt FROM users WHERE username = $1', [req.params.username]);
        if (rows.length === 0) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json({ salt: rows[0].salt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Регистрация нового пользователя
app.post('/api/auth/register', async (req, res) => {
    const { username, masterHash, salt } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO users (username, master_hash, salt) VALUES ($1, $2, $3) RETURNING id',
            [username, masterHash, salt]
        );
        const token = jwt.sign({ userId: rows[0].id, username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
        res.status(201).json({ token });
    } catch (err) {
        // ДОБАВЬ ЭТУ СТРОКУ, ЧТОБЫ УВИДЕТЬ ОШИБКУ В ТЕРМИНАЛЕ:
        console.error("ОШИБКА РЕГИСТРАЦИИ:", err); 
        
        if (err.code === '23505') return res.status(400).json({ message: 'Имя пользователя уже занято' });
        res.status(500).json({ message: err.message });
    }
});

// 3. Вход в систему
app.post('/api/auth/login', async (req, res) => {
    const { username, masterHash } = req.body;
    try {
        const { rows } = await pool.query('SELECT id, master_hash FROM users WHERE username = $1', [username]);
        if (rows.length === 0) return res.status(401).json({ message: 'Неверные учетные данные' });

        if (rows[0].master_hash !== masterHash) {
            return res.status(401).json({ message: 'Неверный мастер-пароль' });
        }

        const token = jwt.sign({ userId: rows[0].id, username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ACCOUNTS ENDPOINTS (Защищены JWT) ---

app.get('/api/accounts', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, blob FROM accounts WHERE user_id = $1 ORDER BY id DESC', [req.user.userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT blob FROM accounts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Запись не найдена' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/accounts', authenticateToken, async (req, res) => {
    try {
        const { blob } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO accounts (user_id, blob) VALUES ($1, $2) RETURNING id',
            [req.user.userId, blob]
        );
        res.status(201).json({ id: rows[0].id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const { blob } = req.body;
        const { rowCount } = await pool.query(
            'UPDATE accounts SET blob = $1 WHERE id = $2 AND user_id = $3',
            [blob, req.params.id, req.user.userId]
        );
        if (rowCount === 0) return res.status(404).json({ message: 'Запись не найдена или нет прав' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM accounts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        if (rowCount === 0) return res.status(404).json({ message: 'Запись не найдена' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Бэкенд запущен на порту ${PORT}`));