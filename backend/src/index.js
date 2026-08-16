require('dotenv').config();
const express = require('express');
const pool= require('./config/db');
const tecnicosRoutes = require("./routes/tecnicos.routes");
const cors = require("cors");


const app = express();

app.use(express.json());


app.get('/api/health', async (req, res) => {
    try{
        const [rows] = await pool.query ('SELECT 1 + 1 AS resultado');
        res.json({
            status: 'OK',
            db: 'Conectada',
            test: rows[0].resultado
        });
    }   catch (error){
        res.status(500).json({
            status: 'ERROR',
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

const productosRouter = require ('./routes/productos.routes');

app.use('/api/productos', productosRouter)

app.listen(PORT, () => {
    console.log(`Servidor Corriendo en http://localhost:${PORT}`);
});

const movimientosRoutes = require('./routes/movimientos.routes');

app.use('/api/movimientos', movimientosRoutes);

app.use(cors());
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

app.use("/api/tecnicos", tecnicosRoutes);
