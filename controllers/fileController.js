const SubmissionFile = require('../models/SubmissionFile');

const downloadFile = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const file = await SubmissionFile.findByPk(id);
    if (!file) return res.status(404).json({ pesan: 'File tidak ditemukan.' });
    return res.sendFile(require('path').resolve(file.storage_path));
  } catch (error) {
    console.error('Error downloadFile:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

module.exports = { downloadFile };
