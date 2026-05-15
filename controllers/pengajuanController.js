const Pengajuan = require('../models/Pengajuan');

const ajukanJudul = async (req, res) => {
    try {
        const { judul, pembimbing1_id, pembimbing2_id } = req.body;
        const mahasiswa_id = req.user.id; // Didapatkan dari token JWT (satpam login)

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
            mahasiswa_id,
            judul,
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

module.exports = { ajukanJudul };