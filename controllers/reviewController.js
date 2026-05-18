const Review = require('../models/Review');
const Pengajuan = require('../models/Pengajuan');

const postReview = async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id, 10);
    const reviewerId = req.user.id;
    const { decision, comment, score } = req.body;

    if (!['setuju', 'revisi', 'tolak'].includes(decision)) {
      return res.status(400).json({ pesan: 'Decision tidak valid.' });
    }

    // Pastikan submission ada
    const submission = await Pengajuan.findByPk(submissionId);
    if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

    // Simpan review
    const review = await Review.create({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      decision,
      comment,
      score
    });

    // Update status sederhana: set pengajuan.status ke nilai decision (map ke status umum)
    let newStatus = submission.status;
    if (decision === 'setuju') newStatus = 'setuju';
    if (decision === 'revisi') newStatus = 'revisi';
    if (decision === 'tolak') newStatus = 'ditolak';

    submission.status = newStatus;
    await submission.save();

    return res.status(201).json({ pesan: 'Review tersimpan.', data: review });
  } catch (error) {
    console.error('Error postReview:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

module.exports = { postReview };
