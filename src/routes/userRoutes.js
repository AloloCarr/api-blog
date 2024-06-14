const express = require('express');
const router = express.Router();

//Para llamar a los controllers:)
const userController = require('../controllers/userController');

//RUTAS USUARIOS
router.get('/users', userController.getUsers);
router.get('/user/:id', userController.getUserById);
router.put('/user/:id', );

module.exports = router;