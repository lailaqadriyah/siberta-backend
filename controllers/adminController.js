const Pengajuan = require('../models/Pengajuan');
const MasterTitle = require('../models/MasterTitle');
const User = require('../models/User');
const taController = require('./taController');

const validateSubmission = async (req, res) => {
  try {
    const submissionId = parseInt(req.params.submissionId, 10);
    const submission = await Pengajuan.findByPk(submissionId);
    if (!submission) return res.status(404).json({ pesan: 'Pengajuan tidak ditemukan.' });

    // Hanya bisa divalidasi jika status sudah setuju oleh dosen
    if (submission.status !== 'setuju') {
      return res.status(400).json({ pesan: 'Pengajuan belum berstatus setuju dari pembimbing.' });
    }

    submission.status = 'validated';
    await submission.save();

    return res.status(200).json({ pesan: 'Pengajuan berhasil divalidasi oleh admin.' });
  } catch (error) {
    console.error('Error validateSubmission:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

const listMasterTitles = async (req, res) => {
  try {
    const rows = await MasterTitle.findAll({ order: [['created_at', 'DESC']] });
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error listMasterTitles:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan server.' });
  }
};

const createMasterTitle = async (req, res) => {
  try {
    const { title, source, notes } = req.body;
    if (!title) return res.status(400).json({ pesan: 'Title wajib diisi.' });
    const row = await MasterTitle.create({ title, source, notes, created_by: req.user.id });
    return res.status(201).json({ data: row });
  } catch (error) {
    console.error('Error createMasterTitle:', error);
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

const triggerSyncML = async (req, res) => {
  // Reuse taController.syncData logic
  return taController.syncData(req, res);
};

module.exports = { validateSubmission, listMasterTitles, createMasterTitle, listUsers, createUser, triggerSyncML };

