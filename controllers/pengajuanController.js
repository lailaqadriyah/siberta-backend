const Pengajuan = require('../models/Pengajuan');
const User = require('../models/User');
const Review = require('../models/Review');
const SubmissionFile = require('../models/SubmissionFile');
const { Op } = require('sequelize');

const canAccessSubmission = (submission, user) => {
    const role = (user?.role || '').toLowerCase();

    if (role === 'admin' || role === 'departemen') return true;
    if (role === 'mahasiswa') return submission.student_id === user.id;
    if (role === 'dosen') {
        return submission.pembimbing1_id === user.id || submission.pembimbing2_id === user.id;
    }

    return false;
};

const ajukanJudul = async (req, res) => {
    try {
        const { judul, pembimbing1_id, pembimbing2_id, abstract, ringkasan } = req.body;
        const student_id = req.user.id; // Didapatkan dari token JWT

        // Validasi input
        if (!judul || !pembimbing1_id) {
            return res.status(400).json({ pesan: 'Judul dan pembimbing 1 wajib diisi!' });
        }

        const normalizedAbstract = abstract !== undefined ? abstract : ringkasan;

        // Cek apakah ada file yang diunggah
        let file_pendukung = null;
        if (req.file) {
            file_pendukung = req.file.filename; // Simpan nama filenya saja ke database
        }

        // Simpan ke database
        const pengajuanBaru = await Pengajuan.create({
            student_id,
            judul,
            abstract: normalizedAbstract,
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

        if (!canAccessSubmission(sub, req.user)) {
            return res.status(403).json({ pesan: 'Tidak memiliki akses ke pengajuan ini.' });
        }

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

        const subs = await Pengajuan.findAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama', 'username']
                }
            ]
        });
        const submissionIds = subs.map((item) => item.id);

        let latestReviewBySubmission = {};
        if (submissionIds.length > 0) {
            const reviews = await Review.findAll({
                where: { submission_id: submissionIds },
                order: [['created_at', 'DESC']]
            });

            reviews.forEach((review) => {
                if (!latestReviewBySubmission[review.submission_id]) {
                    latestReviewBySubmission[review.submission_id] = review;
                }
            });
        }

        const data = subs.map((item) => {
            const submission = item.toJSON();
            const review = latestReviewBySubmission[item.id];

            return {
                ...submission,
                last_review_comment: review?.comment || null,
                last_review_decision: review?.decision || null,
                last_reviewed_at: review?.created_at || null
            };
        });

        return res.status(200).json({ data });
    } catch (error) {
        console.error('Error listSubmissions:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
    }
};

const updateSubmission = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const submission = await Pengajuan.findByPk(id);

        if (!submission) {
            return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });
        }

        if (submission.student_id !== req.user.id) {
            return res.status(403).json({ pesan: 'Tidak memiliki akses mengubah pengajuan ini.' });
        }

        const { judul, abstract, pembimbing1_id, pembimbing2_id } = req.body;

        if (judul !== undefined && !String(judul).trim()) {
            return res.status(400).json({ pesan: 'Judul tidak boleh kosong.' });
        }

        if (judul !== undefined) submission.judul = judul;
        if (abstract !== undefined) submission.abstract = abstract;
        if (pembimbing1_id !== undefined) submission.pembimbing1_id = pembimbing1_id || null;
        if (pembimbing2_id !== undefined) submission.pembimbing2_id = pembimbing2_id || null;

        await submission.save();

        return res.status(200).json({ pesan: 'Pengajuan berhasil diperbarui.', data: submission });
    } catch (error) {
        console.error('Error updateSubmission:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
    }
};

const deleteSubmission = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const submission = await Pengajuan.findByPk(id);

        if (!submission) {
            return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });
        }

        if (submission.student_id !== req.user.id) {
            return res.status(403).json({ pesan: 'Tidak memiliki akses menghapus pengajuan ini.' });
        }

        await submission.destroy();

        return res.status(200).json({ pesan: 'Pengajuan berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleteSubmission:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
    }
};

const uploadFile = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const submission = await Pengajuan.findByPk(id);
        if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

        if (!canAccessSubmission(submission, req.user)) {
            return res.status(403).json({ pesan: 'Tidak memiliki akses ke pengajuan ini.' });
        }

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

        if (!canAccessSubmission(submission, req.user)) {
            return res.status(403).json({ pesan: 'Tidak memiliki akses ke pengajuan ini.' });
        }

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

const getSubmissionReviews = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const submission = await Pengajuan.findByPk(id);
        if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

        if (!canAccessSubmission(submission, req.user)) {
            return res.status(403).json({ pesan: 'Tidak memiliki akses ke pengajuan ini.' });
        }

        const reviews = await Review.findAll({ where: { submission_id: id } });
        return res.status(200).json({ data: reviews });
    } catch (error) {
        console.error('Error getSubmissionReviews:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
    }
};

module.exports = {
    ajukanJudul,
    getSubmission,
    listSubmissions,
    updateSubmission,
    deleteSubmission,
    uploadFile,
    simulateSubmission,
    getSubmissionReviews
};
