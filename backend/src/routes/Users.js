const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const User = require('../models/User');

// @ruta    POST api/users
// @desc    Registrar usuario
// @acceso  Público
router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    // Verificar si el usuario existe
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Crear nueva instancia de usuario
    user = new User({
      nombre,
      email,
      password,
      rol: rol || 'usuario' // Por defecto 'usuario' si no se proporciona rol
    });

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Guardar usuario en la base de datos
    await user.save();

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
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // Puedes definir JWT_EXPIRATION en tu .env si quieres
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

// @ruta    GET api/users
// @desc    Obtener todos los usuarios
// @acceso  Solo administrador
router.get('/', [auth, roleCheck(['administrador'])], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @ruta    GET api/users/me
// @desc    Obtener perfil del usuario actual
// @acceso  Privado
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;