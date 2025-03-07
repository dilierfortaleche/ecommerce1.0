const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');

const app = express();

// Conectar a la base de datos
connectDB();

// Inicializar Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Definir rutas
app.use('/api/users', require('./src/routes/Users'));
app.use('/api/auth', require('./src/routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));