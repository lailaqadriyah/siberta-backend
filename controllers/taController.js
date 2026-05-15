const cekKemiripan = async (req, res) => {
    try {
        const { judul_baru } = req.body || {};

        if (!judul_baru) {
            return res.status(400).json({ pesan: "Judul tidak boleh kosong!" });
        }

        // SIMULASI RESPON DARI MACHINE LEARNING
        setTimeout(() => {
            res.status(200).json({
                pesan: "Pengecekan berhasil",
                judul_input: judul_baru,
                skor_kemiripan_tertinggi: 78.5,
                status: "Perlu Revisi",
                rekomendasi_mirip: [
                    {
                        judul: "Sistem Informasi Geografis Pemetaan Fasilitas Kampus",
                        penulis: "Budi Santoso",
                        tahun: 2024,
                        skor: 78.5
                    },
                    {
                        judul: "Aplikasi Pelaporan Kerusakan Fasilitas Berbasis Mobile",
                        penulis: "Siti Aminah",
                        tahun: 2023,
                        skor: 65.2
                    }
                ]
            });
        }, 1500);

    } catch (error) {
        console.error(error);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
};

module.exports = { cekKemiripan };