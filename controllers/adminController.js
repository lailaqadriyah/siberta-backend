const Pengajuan = require('../models/Pengajuan');
const TugasAkhir = require('../models/TugasAkhir');
const User = require('../models/User');
const Review = require('../models/Review');
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const assignedAdvisorIds = (submission) => {
  return [submission.pembimbing1_id, submission.pembimbing2_id]
    .filter(Boolean)
    .map((id) => Number(id));
};

const latestByReviewer = (reviews) => {
  return reviews.reduce((acc, review) => {
    const key = String(review.reviewer_id);

    if (!acc[key]) {
      acc[key] = review;
    }

    return acc;
  }, {});
};

const getApprovalState = (submission, reviews) => {
  const latest = latestByReviewer(reviews);
  const advisors = assignedAdvisorIds(submission);
  const blockers = [];

  if (advisors.length === 0) {
    blockers.push('Pembimbing belum dipilih.');
  }

  advisors.forEach((advisorId, index) => {
    const review = latest[String(advisorId)];
    const label = `Pembimbing ${index + 1}`;

    if (!review) blockers.push(`${label} belum memberi keputusan.`);
    if (review?.decision === 'revisi') blockers.push(`${label} masih meminta revisi.`);
    if (review?.decision === 'tolak') blockers.push(`${label} menolak pengajuan.`);
  });

  if (submission.status === 'validated') {
    blockers.push('Pengajuan sudah disinkronkan.');
  }

  const canSync =
    submission.status !== 'validated' &&
    advisors.length > 0 &&
    advisors.every((advisorId) => latest[String(advisorId)]?.decision === 'setuju');

  return { canSync, blockers };
};

const validateSubmission = async (req, res) => {
  try {
    const submissionId = parseInt(req.params.submissionId, 10);
    const submission = await Pengajuan.findByPk(submissionId);
    if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

    const reviews = await Review.findAll({
      where: { submission_id: submissionId },
      order: [['created_at', 'DESC'], ['id', 'DESC']]
    });
    const approval = getApprovalState(submission, reviews);

    if (!approval.canSync) {
      return res.status(400).json({
        pesan: 'Pengajuan belum memenuhi syarat untuk sinkronisasi.',
        blockers: approval.blockers
      });
    }

    const student = submission.student_id
      ? await User.findByPk(submission.student_id, { attributes: ['id', 'nama', 'nim', 'username'] })
      : null;
    const studentName = student?.nama || student?.username || `Mahasiswa ${submission.student_id || ''}`.trim();

    const mlRes = await axios.post(`${ML_URL}/add-data-manual`, {
      nama_mahasiswa: studentName,
      judul_ta: submission.judul
    });

    if (mlRes.data?.status === 'ERROR') {
      return res.status(422).json({ pesan: mlRes.data.message || 'ML service menolak data pengajuan.' });
    }

    const tahun = new Date().getFullYear();

    await TugasAkhir.create({
      judul: submission.judul,
      penulis: studentName,
      tahun,
      tema: submission.tema || null,
      similarity_score: submission.similarity_score ?? null,
      pengajuan_id: submission.id
    });

    submission.status = 'validated';
    await submission.save();

    return res.status(200).json({
      pesan: 'Pengajuan berhasil disinkronkan ke database TA dan model ML.',
      data: submission,
      ml: mlRes.data
    });
  } catch (error) {
    console.error('Error validateSubmission:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ pesan: 'ML Service tidak tersedia.' });
    }
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

const listMasterTitles = async (req, res) => {
  try {
    const rows = await TugasAkhir.findAll({ order: [['created_at', 'DESC']] });
    const pengajuanIds = rows
      .map((row) => row.pengajuan_id)
      .filter(Boolean);

    const submissions = pengajuanIds.length > 0
      ? await Pengajuan.findAll({
          where: { id: pengajuanIds },
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
        })
      : [];
    const submissionById = submissions.reduce((acc, submission) => {
      acc[submission.id] = submission.toJSON();
      return acc;
    }, {});

    const data = rows.map((row) => {
      const item = row.toJSON();

      return {
        ...item,
        title: item.judul,
        origin_submission: item.pengajuan_id ? submissionById[item.pengajuan_id] || null : null
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error listTugasAkhir:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

const listUsers = async (req, res) => {
  try {
    const rows = await User.findAll({ attributes: ['id', 'nama', 'username', 'role'] });
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error listUsers:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { nama, username, password, role } = req.body;
    if (!nama || !username || !password || !role) return res.status(400).json({ pesan: 'Semua field wajib diisi.' });
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({ nama, username, password: hashed, role });
    return res.status(201).json({ data: { id: user.id, nama: user.nama, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error createUser:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

module.exports = { validateSubmission, listMasterTitles, listUsers, createUser };
