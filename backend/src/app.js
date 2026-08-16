const express = require('express');
const cors = require('cors');

const app = express();

// 👇 ESTA LÍNEA ES LA CLAVE
app.options('*', cors());

// 👇 CORS TOTALMENTE ABIERTO (para pruebas)
app.use(cors());

// 👇 BODY PARSER
app.use(express.json());

// 👇 RUTAS
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const movimientosRoutes = require('./routes/movimientos.routes');
const tecnicosRoutes = require("./routes/tecnicos.routes");

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use("/api/tecnicos", tecnicosRoutes);

// 👇 TEST
app.get('/api/health', (req, res) => {
  res.json({ status: "OK", db: "Conectada" });
});
app.use("/api/tecnicos", tecnicosRoutes);

module.exports = app;