const express = require('express');
const multer = require('multer');
const Karya = require('../models/karya');

const router = express.Router();

// Setup multer untuk menyimpan file ke folder uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

/**
 * POST /api/karya
 * Upload karya baru
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { nama, harga, kategori, sub_kategori, deskripsi, lisensi } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    if (!nama || !harga || !kategori || !deskripsi || !lisensi) {
      return res.status(400).json({ message: 'Field tidak lengkap' });
    }

    const finalLisensi = lisensi === 'Exclusive' ? 'eksklusif'
                        : lisensi === 'Non-Exclusive' ? 'non eksklusif'
                        : null;

    if (!finalLisensi) {
      return res.status(400).json({ message: 'Lisensi tidak valid' });
    }

    let finalKategori = kategori.toLowerCase();
    if (finalKategori === 'gambar') {
      const allowedSub = ['3d', 'pemandangan', 'vintage'];
      if (!sub_kategori || !allowedSub.includes(sub_kategori.toLowerCase())) {
        return res.status(400).json({ message: 'Sub-kategori tidak valid atau kosong' });
      }
      finalKategori = sub_kategori.toLowerCase();
    }

    const newKarya = await Karya.create({
      nama,
      harga: parseInt(harga),
      kategori: finalKategori,
      deskripsi,
      lisensi: finalLisensi,
      file_path: req.file.path
    });

    return res.status(201).json({ message: 'Karya berhasil diupload', karya: newKarya });
  } catch (error) {
    console.error('❌ Gagal upload karya:', error.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

/**
 * GET /api/karya
 * Ambil semua karya atau berdasarkan query kategori
 */
router.get('/', async (req, res) => {
  try {
    const { kategori } = req.query;
    const where = {};

    if (kategori) {
      where.kategori = kategori.toLowerCase();
    }

    const karyas = await Karya.findAll({ where });
    return res.status(200).json(karyas);
  } catch (error) {
    console.error('❌ Gagal ambil karya:', error.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

/**
 * GET /api/karya/puisi
 * Ambil hanya karya kategori puisi
 */
router.get('/puisi', async (req, res) => {
  try {
    const karyas = await Karya.findAll({ where: { kategori: 'puisi' } });
    return res.status(200).json(karyas);
  } catch (error) {
    console.error('❌ Gagal ambil puisi:', error.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;
