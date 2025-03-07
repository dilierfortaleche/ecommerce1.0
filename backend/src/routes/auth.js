const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/Auth'); // Asegúrate de que esto coincida con tu estructura de carpetas.
const User = require('../models/User');

// Cargar variables de entorno
require('dotenv').config();

// @ruta    POST api/auth
// @desc    Autenticar usuario y obtener token
// @acceso  Público
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar existencia del usuario
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // Crear payload JWT
        const payload = {
            user: {
                id: user.id,
                rol: user.rol
            }
        };

        // Firmar token
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Usar variable de entorno
            { expiresIn: process.env.JWT_EXPIRATION }, // Usar variable de entorno
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @ruta    GET api/auth
// @desc    Obtener usuario autenticado
// @acceso  Privado
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;