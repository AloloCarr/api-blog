const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');


// Registrar usuario
const registrer = async (req, res) => {
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
            .query('SELECT * FROM Users WHERE email = @email');

        const user = result.recordset[0];
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(401).send('email or contraseña invalidas');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken,
    registrer,
    login
 };
