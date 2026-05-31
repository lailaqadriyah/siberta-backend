const Review = require('../models/Review');
const Pengajuan = require('../models/Pengajuan');

const assignedAdvisorIds = (submission) => {
  return [submission.pembimbing1_id, submission.pembimbing2_id]
    .filter(Boolean)
    .map((id) => Number(id));
};

const resolveSubmissionStatus = (submission, reviews) => {
  const latestByReviewer = reviews.reduce((acc, review) => {
    const key = String(review.reviewer_id);

    if (!acc[key]) {
      acc[key] = review;
    }

    return acc;
  }, {});

  const requiredAdvisorIds = assignedAdvisorIds(submission);

  if (requiredAdvisorIds.some((id) => latestByReviewer[String(id)]?.decision === 'tolak')) {
    return 'ditolak';
  }

  if (requiredAdvisorIds.some((id) => latestByReviewer[String(id)]?.decision === 'revisi')) {
    return 'revisi';
  }

  if (
    requiredAdvisorIds.length > 0 &&
    requiredAdvisorIds.every((id) => latestByReviewer[String(id)]?.decision === 'setuju')
  ) {
    return 'setuju';
  }

  return 'menunggu_pembimbing';
};

const postReview = async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id, 10);
    const reviewerId = req.user.id;
    const { decision, comment } = req.body;

    if (!['setuju', 'revisi', 'tolak'].includes(decision)) {
      return res.status(400).json({ pesan: 'Decision tidak valid.' });
    }

    const submission = await Pengajuan.findByPk(submissionId);
    if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

    if (submission.status === 'validated') {
      return res.status(400).json({ pesan: 'Pengajuan sudah disinkronkan dan tidak dapat direview lagi.' });
    }

    if (!assignedAdvisorIds(submission).includes(Number(reviewerId))) {
      return res.status(403).json({ pesan: 'Anda bukan pembimbing pada pengajuan ini.' });
    }

    const normalizedComment = decision === 'setuju' ? null : String(comment || '').trim();

    if (decision !== 'setuju' && !normalizedComment) {
      return res.status(400).json({ pesan: 'Catatan wajib diisi untuk keputusan revisi atau tolak.' });
    }

    const review = await Review.create({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      decision,
      comment: normalizedComment
    });

    const reviews = await Review.findAll({
      where: { submission_id: submissionId },
      order: [['created_at', 'DESC'], ['id', 'DESC']]
    });

    submission.status = resolveSubmissionStatus(submission, reviews);
    await submission.save();

    return res.status(201).json({ pesan: 'Review tersimpan.', data: review, status: submission.status });
  } catch (error) {
    console.error('Error postReview:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

module.exports = { postReview };
