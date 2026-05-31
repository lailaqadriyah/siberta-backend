const Pengajuan = require('../models/Pengajuan');
const path = require('path');

const canAccessSubmission = (submission, user) => {
  const role = (user?.role || '').toLowerCase();

  if (role === 'admin' || role === 'departemen') return true;
  if (role === 'mahasiswa') return submission.student_id === user.id;
  if (role === 'dosen') {
    return submission.pembimbing1_id === user.id || submission.pembimbing2_id === user.id;
  }

  return false;
};

const downloadSubmissionFile = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const submission = await Pengajuan.findByPk(id);
    if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

    if (!submission.file_pendukung) {
      return res.status(404).json({ pesan: 'File pendukung tidak ditemukan.' });
    }

    if (!canAccessSubmission(submission, req.user)) {
      return res.status(403).json({ pesan: 'Tidak memiliki akses ke file ini.' });
    }

    const parts = submission.file_pendukung.split('|');
    const diskFilename = parts[0];
    const originalFilename = parts[1] || parts[0];

    const filePath = path.resolve('uploads', diskFilename);
    return res.download(filePath, originalFilename);
  } catch (error) {
    console.error('Error downloadSubmissionFile:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

module.exports = { downloadSubmissionFile };
