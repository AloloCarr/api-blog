const sql = require("mssql");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads";

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
  },
});

const upload = multer({ storage: storage });

// Traer todas las publicaciones
const getPosts = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query("SELECT * FROM Posts");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Traer la publicación por ID
const getPostById = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Posts WHERE id = @id");

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .send("No se encontró ninguna publicación con ese ID");
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
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "/blogImgs",
      });
      img = uploadResult.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const createdAt = new Date();
    const pool = await sql.connect();
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("author", sql.NVarChar, author)
      .input("title", sql.NVarChar, title)
      .input("content", sql.NVarChar, content)
      .input("createdAt", sql.DateTime, createdAt)
      .input("img", sql.NVarChar, img)
      .query(
        "INSERT INTO Posts (userId, author, title, content, createdAt, img) VALUES (@userId, @author, @title, @content, @createdAt, @img)"
      );
    res.status(201).send("Se creo la publicación exitosamente");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//actualizar una publicación
const putPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("id", sql.Int, postId)
      .query("SELECT * FROM Posts WHERE id = @id");

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .send("No se encontró ninguna publicación con ese ID");
    } else {
      const { title, content, img } = req.body;
      let updateFields = [];
      let parameters = { id: postId };

      if (title !== undefined && title !== "") {
        updateFields.push("title = @title");
        parameters.title = title;
      }
      if (content !== undefined && content !== "") {
        updateFields.push("content = @content");
        parameters.content = content;
      }
      if (img !== undefined && img !== "") {
        updateFields.push("img = @img");
        parameters.img = img;
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .send("No se proporcionaron datos para actualizar");
      }

      const updateQuery = `UPDATE Posts SET ${updateFields.join(
        ", "
      )} WHERE id = @id`;
      await pool
        .request()
        .input("id", sql.Int, postId)
        .input("title", sql.NVarChar, parameters.title)
        .input("content", sql.NVarChar, parameters.content)
        .input("img", sql.NVarChar, parameters.img)
        .query(updateQuery);

      res.status(200).send("Se actualizó la publicación exitosamente");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
    .input("id", sql.Int, req.params.id)
    .query('SELECT * FROM Posts WHERE id = @id');

    if(result.recordset.length == 0){
      return res.status(404).send('No se encontro la publicación');
    }else{
      await pool.request()
      .input("id", sql.Int, req.params.id)
      .query('DELETE Posts WHERE id = @id');

      res.status(200).send('La publicación se elimino con éxito');
    }

  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost: [upload.single("img"), createPost],
  putPost: [upload.single("img"), putPost],
  deletePost,
};
