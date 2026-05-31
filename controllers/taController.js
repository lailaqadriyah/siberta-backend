const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const statusLabel = {
    HIJAU: 'Aman',
    KUNING: 'Perlu Revisi',
    MERAH: 'Tidak Aman - Ubah Judul',
};

const cekKemiripan = async (req, res) => {
    try {
        const { judul_baru } = req.body || {};

        if (!judul_baru) {
            return res.status(400).json({ pesan: 'Judul tidak boleh kosong!' });
        }

        const mlRes = await axios.post(`${ML_URL}/check`, { judul: judul_baru });
        const { status, max_score, matches } = mlRes.data;

        if (status === 'ERROR') {
            return res.status(422).json({ pesan: mlRes.data.message || 'Judul tidak valid.' });
        }

        return res.status(200).json({
            pesan: 'Pengecekan berhasil',
            judul_input: judul_baru,
            skor_kemiripan_tertinggi: max_score,
            status: statusLabel[status] || status,
            status_kode: status,
            rekomendasi_mirip: matches,
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({ pesan: 'ML Service tidak tersedia. Pastikan Python service sudah berjalan.' });
        }
        console.error(error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan pada server.' });
    }
};

const tambahData = async (req, res) => {
    try {
        const { nama_mahasiswa, judul_ta } = req.body || {};

        if (!nama_mahasiswa || !judul_ta) {
            return res.status(400).json({ pesan: 'nama_mahasiswa dan judul_ta wajib diisi.' });
        }

        const mlRes = await axios.post(`${ML_URL}/add-data-manual`, { nama_mahasiswa, judul_ta });

        if (mlRes.data.status === 'ERROR') {
            return res.status(422).json({ pesan: mlRes.data.message });
        }

        return res.status(201).json({
            pesan: mlRes.data.message || 'Data berhasil ditambahkan dan disinkronkan.',
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({ pesan: 'ML Service tidak tersedia.' });
        }
        console.error(error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { cekKemiripan, tambahData };
