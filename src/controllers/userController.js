const sql = require("mssql");
const bcrypt = require("bcryptjs");

//traer todos usuarios
const getUsers = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query("SELECT * FROM Users");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//traer un solo usuario
const getUserById = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Users WHERE id = @id");

    if (result.recordset.length == 0) {
      return res.status(404).send("No se encontro a ningún usuario con ese ID");
    } else {
      res.json(result.recordset[0]);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.params.id;

    const pool = await sql.connect();
    const userResult = await pool
      .request()
      .input("id", sql.Int, userId)
      .query("SELECT * FROM Users WHERE id = @id");

    if (userResult.recordset.length === 0) {
      return res.status(404).send("No se encontró ningún usuario con ese ID");
    }

    const emailCheck = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    if (emailCheck.recordset.length > 0 && emailCheck.recordset[0].id !== userId) {
      return res.status(400).send("El correo electrónico ya está en uso.");
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateFields = [];
    const parameters = { id: userId };
    if (name !== undefined && name !== '') {
      updateFields.push('name = @name');
      parameters.name = name;
    }
    if (email !== undefined && email !== '') {
      updateFields.push('email = @email');
      parameters.email = email;
    }
    if (hashedPassword !== null) {
      updateFields.push('password = @password');
      parameters.password = hashedPassword;
    }

    if (updateFields.length === 0) {
      return res.status(400).send("No se proporcionaron datos para actualizar");
    }

    const updateQuery = `UPDATE Users SET ${updateFields.join(', ')} WHERE id = @id`;
    await pool.request()
      .input("id", sql.Int, userId)
      .input("name", sql.NVarChar, parameters.name)
      .input("email", sql.NVarChar, parameters.email)
      .input("password", sql.NVarChar, parameters.password)
      .query(updateQuery);

    res.status(200).send("Usuario actualizado exitosamente");
  } catch (err) {
    res.status(500).send(err.message);
  }
};


//borrar usuario
const deleteUser = async (req, res) => {
  try {
    const pool = await sql.connect();

    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Users WHERE id = @id");

    if (result.recordset.length == 0) {
      return res.status(404).send("No se encontro a ningún usuario con ese ID");
    } else {
      await pool
        .request()
        .input("id", sql.Int, req.params.id)
        .query(
          "DELETE Users WHERE id = @id"
        );

      res.status(200).send("Usuario eliminado exitosamente");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
