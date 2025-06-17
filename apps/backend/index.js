const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const karyaRoutes = require('./routes/karya');
const transaksiRoutes = require('./routes/transaksi');
const downloadRoutes = require('./routes/download');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/karya', karyaRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/download', downloadRoutes);

// Optional dummy endpoint
app.get('/api/notifikasi', (req, res) => {
  res.json([{ id: 1, message: 'Pesan dummy berhasil' }]);
});

module.exports = app;
module.exports.handler = serverless(app);
