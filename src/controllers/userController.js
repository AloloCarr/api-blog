const sql = require('mssql');

//traer todos usuarios
const getUsers = async (req, res ) =>{
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

//traer un solo usuario
const getUserById = async(req, res)=>{
    try {
        const pool = await sql.connect();
        const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('SELECT * FROM Users WHERE id = @id');

        if(result.recordset.length == 0){
            return res.status(404).send('No se encontro a ningún usuario con ese ID');

        }else{
            res.json(result.recordset[0]);
        }
        

    } catch (err) {
        res.status(500).send(err.message);
    }
}

//actualizar usuario
const updateUser = async (req, res) =>{
    try {
        const {name, email, password} = req.body;
        const emailCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (emailCheck.recordset.length > 0) {
            return res.status(400).send('El correo electrónico ya existe.');
        }else{
            const hashedPassword = await bcrypt.hash(password, 10);

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .query('UPDATE Users set name = @name, email = @email, password = @password WHERE id = @id ');
        
        res.status(200).send('Usuario actualizado'); 
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
}

//borrar usuario
const deleteUser = (req, res) =>{

}

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
}