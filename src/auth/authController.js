const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const secret = process.env.JWT_SECRET;

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Registrar usuario
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const pool = await sql.connect();

        const emailCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (emailCheck.recordset.length > 0) {
            return res.status(400).send('El correo electrónico ya está registrado.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .query('INSERT INTO Users (name, email, password) VALUES (@name, @email, @password)');

        res.status(200).send('Usuario registrado');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await sql.connect();
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT TOP 1 * FROM Users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(401).send('El correo electrónico o la contraseña son incorrectos');
        }

        const user = result.recordset[0];
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(401).send('El correo electrónico o la contraseña son incorrectos');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    authenticateToken,
    register,
    login
};
