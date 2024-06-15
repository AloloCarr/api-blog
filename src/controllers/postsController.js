const sql = require('mssql');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Traer todas las publicaciones
const getPosts = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM Posts');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Traer la publicación por ID
const getPostById = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Posts WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).send("No se encontró ninguna publicación con ese ID");
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Hacer una publicación
const createPost = async (req, res) => {
    try {
        const { author, title, content } = req.body;

        const userId = req.user.id;
        let img = null;

        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path);
            img = uploadResult.secure_url;
        }

        const createdAt = new Date();
        const pool = await sql.connect();
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('author', sql.NVarChar, author)
            .input('title', sql.NVarChar, title)
            .input('content', sql.NVarChar, content)
            .input('createdAt', sql.DateTime, createdAt)
            .input('img', sql.NVarChar, img)
            .query('INSERT INTO Posts (userId, author, title, content, createdAt, img) VALUES (@userId, @author, @title, @content, @createdAt, @img)');
        res.status(201).send('Post created');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const putPost = async (req, res) => {
};

const deletePost = async (req, res) => {
};

module.exports = {
    getPosts,
    getPostById,
    createPost: [upload.single('img'), createPost], 
    putPost,
    deletePost
};
