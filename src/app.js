const express = require('express');
const config = require('./config');

const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const posts = require('./routes/postRoutes');


//middleware
const morgan = require('morgan');

const app = express();

//configuracion
app.set('port', config.app.port)



// Middlewares 
app.use(morgan("dev"));
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

//rutas
app.use('/api', auth)
app.use('/api', users)
app.use('/api', posts)

//para ver si jala la api
app.get('/', (req, res ) =>{
    res.send('api Ok')
})

module.exports = app;