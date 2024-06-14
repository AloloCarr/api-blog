const sql = require('mssql')
require('dotenv').config();

const dbSettings = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,  
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

async function getConnection() {
    try {
        const pool = await sql.connect(dbSettings);
        console.log('Conectado a SQL Server');
        return pool;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        throw err;
    }
}

getConnection();



