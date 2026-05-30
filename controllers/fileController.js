const SubmissionFile = require('../models/SubmissionFile');
const Pengajuan = require('../models/Pengajuan');

const canAccessSubmission = (submission, user) => {
  const role = (user?.role || '').toLowerCase();

  if (role === 'admin' || role === 'departemen') return true;
  if (role === 'mahasiswa') return submission.student_id === user.id;
  if (role === 'dosen') {
    return submission.pembimbing1_id === user.id || submission.pembimbing2_id === user.id;
  }

  return false;
};

const downloadFile = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const file = await SubmissionFile.findByPk(id);
    if (!file) return res.status(404).json({ pesan: 'File tidak ditemukan.' });

    const submission = await Pengajuan.findByPk(file.submission_id);
    if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

    if (!canAccessSubmission(submission, req.user)) {
      return res.status(403).json({ pesan: 'Tidak memiliki akses ke file ini.' });
    }
    return res.sendFile(require('path').resolve(file.storage_path));
  } catch (error) {
    console.error('Error downloadFile:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

module.exports = { downloadFile };
