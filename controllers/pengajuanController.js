const Pengajuan = require('../models/Pengajuan');
const Review = require('../models/Review');
const SubmissionFile = require('../models/SubmissionFile');
const { Op } = require('sequelize');

const ajukanJudul = async (req, res) => {
    try {
        const { judul, pembimbing1_id, pembimbing2_id, abstract } = req.body;
        const student_id = req.user.id; // Didapatkan dari token JWT

        // Validasi input
        if (!judul || !pembimbing1_id || !pembimbing2_id) {
            return res.status(400).json({ pesan: "Judul dan kedua dosen pembimbing wajib diisi!" });
        }

        // Cek apakah ada file yang diunggah
        let file_pendukung = null;
        if (req.file) {
            file_pendukung = req.file.filename; // Simpan nama filenya saja ke database
        }

        // Simpan ke database
        const pengajuanBaru = await Pengajuan.create({
            student_id,
            judul,
            abstract,
            pembimbing1_id,
            pembimbing2_id,
            file_pendukung
        });

        res.status(201).json({
            pesan: "Pengajuan judul berhasil dikirim!",
            data: pengajuanBaru
        });

    } catch (error) {
        console.error("Error saat mengajukan judul:", error);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
};

const getSubmission = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const sub = await Pengajuan.findByPk(id);
        if (!sub) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

        const reviews = await Review.findAll({ where: { submission_id: id } });
        const files = await SubmissionFile.findAll({ where: { submission_id: id } });

        return res.status(200).json({ data: sub, reviews, files });
    } catch (error) {
        console.error('Error getSubmission:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
    }
};

const listSubmissions = async (req, res) => {
    try {
        const role = req.user.role;
        const uid = req.user.id;
        const where = {};

        if (role === 'mahasiswa') {
            where.student_id = uid;
        } else if (role === 'dosen') {
            // show submissions where user is one of the pembimbing
            where[Op.or] = [{ pembimbing1_id: uid }, { pembimbing2_id: uid }];
        }

        const subs = await Pengajuan.findAll({ where, order: [['created_at', 'DESC']] });
        return res.status(200).json({ data: subs });
    } catch (error) {
        console.error('Error listSubmissions:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
    }
};

const uploadFile = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const submission = await Pengajuan.findByPk(id);
        if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

        if (!req.file) return res.status(400).json({ pesan: 'File tidak ditemukan di request.' });

        const fileRecord = await SubmissionFile.create({
            submission_id: id,
            filename: req.file.filename,
            storage_path: req.file.path,
            mime: req.file.mimetype,
            uploaded_by: req.user.id
        });

        return res.status(201).json({ pesan: 'File berhasil diunggah.', data: fileRecord });
    } catch (error) {
        console.error('Error uploadFile:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server saat upload file.' });
    }
};

const simulateSubmission = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { text } = req.body;
        if (!text) return res.status(400).json({ pesan: 'Text untuk simulasi wajib diisi.' });

        const submission = await Pengajuan.findByPk(id);
        if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

        // Panggil ML service
        const axios = require('axios');
        const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

        const mlRes = await axios.post(`${ML_URL}/check`, { judul_baru: text });
        const { max_score, matches } = mlRes.data || {};

        // Simpan skor kemiripan ke submission
        submission.similarity_score = typeof max_score === 'number' ? max_score : null;
        // optionally store vector id if ML returns one
        if (mlRes.data.sbert_vector_id) submission.sbert_vector_id = mlRes.data.sbert_vector_id;
        await submission.save();

        return res.status(200).json({ pesan: 'Simulasi selesai.', similarity_score: submission.similarity_score, matches: matches || [] });
    } catch (error) {
        console.error('Error simulateSubmission:', error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({ pesan: 'ML Service tidak tersedia.' });
        }
        return res.status(500).json({ pesan: 'Terjadi kesalahan server saat simulasi.' });
    }
};

module.exports = { ajukanJudul, getSubmission, listSubmissions, uploadFile, simulateSubmission };
