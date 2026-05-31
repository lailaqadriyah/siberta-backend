const Pengajuan = require('../models/Pengajuan');
const User = require('../models/User');
const Review = require('../models/Review');
const { Op } = require('sequelize');
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const VALID_TEMA = ['EA', 'BI', 'ML', 'SPK', 'ERP'];

const normalizeTema = (tema) => {
    const value = String(tema || '').trim().toUpperCase();
    return VALID_TEMA.includes(value) ? value : null;
};

const normalizeScore = (score) => {
    if (score === undefined || score === null || score === '') return null;

    const value = Number(score);
    if (!Number.isFinite(value) || value < 0 || value > 100) return null;

    return value;
};

const normalizeTitle = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const assignedAdvisorIds = (submission) => {
    return [submission.pembimbing1_id, submission.pembimbing2_id]
        .filter(Boolean)
        .map((id) => Number(id));
};

const canAccessSubmission = (submission, user) => {
    const role = (user?.role || '').toLowerCase();

    if (role === 'admin' || role === 'departemen') return true;
    if (role === 'mahasiswa') return submission.student_id === user.id;
    if (role === 'dosen') {
        return assignedAdvisorIds(submission).includes(Number(user.id));
    }

    return false;
};

const groupBySubmission = (rows) => {
    return rows.reduce((acc, row) => {
        const plain = typeof row.toJSON === 'function' ? row.toJSON() : row;
        const key = plain.submission_id;

        if (!acc[key]) acc[key] = [];
        acc[key].push(plain);

        return acc;
    }, {});
};

const getLatestReviewByReviewer = (reviews) => {
    return reviews.reduce((acc, review) => {
        const key = String(review.reviewer_id);

        if (!acc[key]) {
            acc[key] = review;
        }

        return acc;
    }, {});
};

const buildAdvisorSummary = (submission, reviews, user) => {
    const latestByReviewer = getLatestReviewByReviewer(reviews);
    const reviewerRole = (user?.role || '').toLowerCase();
    const currentUserId = Number(user?.id);

    const advisorSlots = [
        {
            key: 'pembimbing1',
            label: 'Pembimbing 1',
            id: submission.pembimbing1_id,
            dosen: submission.pembimbing1 || null
        },
        {
            key: 'pembimbing2',
            label: 'Pembimbing 2',
            id: submission.pembimbing2_id,
            dosen: submission.pembimbing2 || null
        }
    ].filter((slot) => slot.id);

    const advisorReviews = advisorSlots.reduce((acc, slot) => {
        const review = latestByReviewer[String(slot.id)] || null;

        acc[slot.key] = {
            label: slot.label,
            reviewer_id: slot.id,
            nama: slot.dosen?.nama || null,
            username: slot.dosen?.username || null,
            decision: review?.decision || null,
            comment: review?.comment || null,
            reviewed_at: review?.created_at || null,
            status: review?.decision || 'menunggu'
        };

        return acc;
    }, {});

    const requiredCount = advisorSlots.length;
    const approvedCount = advisorSlots.filter((slot) => {
        return latestByReviewer[String(slot.id)]?.decision === 'setuju';
    }).length;
    const hasRevision = advisorSlots.some((slot) => {
        return latestByReviewer[String(slot.id)]?.decision === 'revisi';
    });
    const hasRejected = advisorSlots.some((slot) => {
        return latestByReviewer[String(slot.id)]?.decision === 'tolak';
    });
    const pendingSlots = advisorSlots.filter((slot) => !latestByReviewer[String(slot.id)]?.decision);

    const blockers = [];
    if (requiredCount === 0) {
        blockers.push('Pembimbing belum dipilih.');
    }
    pendingSlots.forEach((slot) => blockers.push(`${slot.label} belum memberi keputusan.`));
    if (hasRevision) blockers.push('Masih ada keputusan revisi.');
    if (hasRejected) blockers.push('Masih ada keputusan tolak.');
    if (submission.status === 'validated') blockers.push('Pengajuan sudah disinkronkan.');

    const approvalComplete = requiredCount > 0 && approvedCount === requiredCount && !hasRevision && !hasRejected;
    let currentUserPosition = null;

    if (reviewerRole === 'dosen') {
        if (Number(submission.pembimbing1_id) === currentUserId) currentUserPosition = 'Pembimbing 1';
        if (Number(submission.pembimbing2_id) === currentUserId) currentUserPosition = 'Pembimbing 2';
    }

    return {
        current_user_position: currentUserPosition,
        advisor_reviews: advisorReviews,
        approval_status: {
            required_count: requiredCount,
            approved_count: approvedCount,
            pending_count: pendingSlots.length,
            approval_complete: approvalComplete,
            can_sync: approvalComplete && submission.status !== 'validated',
            blockers
        }
    };
};

const enrichSubmissions = async (submissions, user) => {
    const ids = submissions.map((item) => item.id);

    if (ids.length === 0) return [];

    const reviews = await Review.findAll({
        where: { submission_id: { [Op.in]: ids } },
        order: [['created_at', 'DESC'], ['id', 'DESC']]
    });

    const reviewsBySubmission = groupBySubmission(reviews);

    return submissions.map((item) => {
        const submission = typeof item.toJSON === 'function' ? item.toJSON() : item;
        const submissionReviews = reviewsBySubmission[submission.id] || [];
        const latestReview = submissionReviews[0] || null;
        const advisorSummary = buildAdvisorSummary(submission, submissionReviews, user);

        return {
            ...submission,
            files: [],
            legacy_file: submission.file_pendukung
                ? {
                    filename: submission.file_pendukung,
                    is_legacy: true
                }
                : null,
            reviews: submissionReviews,
            last_review_comment: latestReview?.comment || null,
            last_review_decision: latestReview?.decision || null,
            last_reviewed_at: latestReview?.created_at || null,
            ...advisorSummary
        };
    });
};

const ajukanJudul = async (req, res) => {
    try {
        const {
            judul,
            tema,
            pembimbing1_id,
            pembimbing2_id,
            abstract,
            ringkasan,
            similarity_score,
            similarity_checked_title
        } = req.body;
        const student_id = req.user.id;

        if (!judul || !String(judul).trim() || !pembimbing1_id) {
            return res.status(400).json({ pesan: 'Judul dan pembimbing 1 wajib diisi.' });
        }

        const normalizedTema = normalizeTema(tema);
        if (!normalizedTema) {
            return res.status(400).json({ pesan: 'Tema TA wajib dipilih dan harus valid.' });
        }

        const normalizedScore = normalizeScore(similarity_score);
        if (normalizedScore === null) {
            return res.status(400).json({ pesan: 'Lakukan pengecekan kemiripan terlebih dahulu sebelum mengajukan judul.' });
        }

        if (
            similarity_checked_title &&
            normalizeTitle(similarity_checked_title) !== normalizeTitle(judul)
        ) {
            return res.status(400).json({ pesan: 'Judul berubah setelah pengecekan. Silakan cek kemiripan ulang.' });
        }

        const pembimbing1Id = Number(pembimbing1_id);
        const pembimbing2Id = pembimbing2_id ? Number(pembimbing2_id) : null;

        if (pembimbing2Id && pembimbing1Id === pembimbing2Id) {
            return res.status(400).json({ pesan: 'Pembimbing 1 dan pembimbing 2 tidak boleh sama.' });
        }

        const normalizedAbstract = abstract !== undefined ? abstract : ringkasan;
        const file_pendukung = req.file ? req.file.filename : null;

        const pengajuanBaru = await Pengajuan.create({
            student_id,
            judul: String(judul).trim(),
            abstract: normalizedAbstract,
            tema: normalizedTema,
            pembimbing1_id: pembimbing1Id,
            pembimbing2_id: pembimbing2Id,
            file_pendukung,
            status: 'diajukan',
            similarity_score: normalizedScore
        });

        res.status(201).json({
            pesan: 'Pengajuan judul berhasil dikirim.',
            data: pengajuanBaru
        });

    } catch (error) {
        console.error('Error saat mengajukan judul:', error);
        res.status(500).json({ pesan: 'Terjadi kesalahan pada server.' });
    }
};

const getSubmission = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const sub = await Pengajuan.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama', 'username', 'nim']
                },
                {
                    model: User,
                    as: 'pembimbing1',
                    attributes: ['id', 'nama', 'username']
                },
                {
                    model: User,
                    as: 'pembimbing2',
                    attributes: ['id', 'nama', 'username']
                }
            ]
        });
        if (!sub) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

        if (!canAccessSubmission(sub, req.user)) {
            return res.status(403).json({ pesan: 'Tidak memiliki akses ke pengajuan ini.' });
        }

        const [data] = await enrichSubmissions([sub], req.user);

        return res.status(200).json({ data, reviews: data.reviews, files: data.files });
    } catch (error) {
        console.error('Error getSubmission:', error);
        return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
    }
};

const listSubmissions = async (req, res) => {
    try {
        const role = (req.user.role || '').toLowerCase();
        const uid = req.user.id;
        const where = {};

        if (role === 'mahasiswa') {
            where.student_id = uid;
        } else if (role === 'dosen') {
            where[Op.or] = [{ pembimbing1_id: uid }, { pembimbing2_id: uid }];
        }

        const subs = await Pengajuan.findAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama', 'username', 'nim']
                },
                {
                    model: User,
                    as: 'pembimbing1',
                    attributes: ['id', 'nama', 'username']
                },
                {
                    model: User,
                    as: 'pembimbing2',
                    attributes: ['id', 'nama', 'username']
                }
            ]
        });

        const data = await enrichSubmissions(subs, req.user);

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

        const { judul, abstract, pembimbing1_id, pembimbing2_id, tema, similarity_score } = req.body;

        if (judul !== undefined && !String(judul).trim()) {
            return res.status(400).json({ pesan: 'Judul tidak boleh kosong.' });
        }

        if (tema !== undefined) {
            const normalizedTema = normalizeTema(tema);
            if (!normalizedTema) return res.status(400).json({ pesan: 'Tema TA tidak valid.' });
            submission.tema = normalizedTema;
        }

        if (similarity_score !== undefined) {
            const normalizedScore = normalizeScore(similarity_score);
            if (normalizedScore === null) return res.status(400).json({ pesan: 'Skor kemiripan tidak valid.' });
            submission.similarity_score = normalizedScore;
        }

        if (judul !== undefined) submission.judul = String(judul).trim();
        if (abstract !== undefined) submission.abstract = abstract;
        if (pembimbing1_id !== undefined) submission.pembimbing1_id = pembimbing1_id || null;
        if (pembimbing2_id !== undefined) submission.pembimbing2_id = pembimbing2_id || null;

        if (
            submission.pembimbing1_id &&
            submission.pembimbing2_id &&
            Number(submission.pembimbing1_id) === Number(submission.pembimbing2_id)
        ) {
            return res.status(400).json({ pesan: 'Pembimbing 1 dan pembimbing 2 tidak boleh sama.' });
        }

        if (submission.status === 'revisi') {
            submission.status = 'diajukan';
        }

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

        submission.file_pendukung = req.file.filename;
        await submission.save();

        return res.status(201).json({
            pesan: 'File berhasil diunggah.',
            data: {
                submission_id: id,
                filename: submission.file_pendukung,
                is_legacy: true
            }
        });
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

        const mlRes = await axios.post(`${ML_URL}/check`, { judul: text });
        const { max_score, matches } = mlRes.data || {};

        submission.similarity_score = typeof max_score === 'number' ? max_score : null;
        await submission.save();

        return res.status(200).json({
            pesan: 'Simulasi selesai.',
            similarity_score: submission.similarity_score,
            matches: matches || []
        });
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

        const reviews = await Review.findAll({
            where: { submission_id: id },
            order: [['created_at', 'DESC'], ['id', 'DESC']]
        });
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
