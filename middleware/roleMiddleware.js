// Fungsi utama untuk mengecek role
const checkRole = (roleYangDiizinkan) => {
    return (req, res, next) => {
        // Pastikan user sudah melewati authMiddleware (punya token)
        if (!req.user) {
            return res.status(401).json({ pesan: "Akses ditolak! Anda belum login." });
        }

        // Cek apakah rolenya cocok
        if (req.user.role !== roleYangDiizinkan) {
            return res.status(403).json({ 
                pesan: `Akses ditolak! Halaman ini hanya untuk ${roleYangDiizinkan}.` 
            });
        }

        // Jika cocok, silakan masuk ke controller
        next();
    };
};

// Buat 3 middleware spesifik agar mudah dipanggil di routes
const isMahasiswa = checkRole('mahasiswa');
const isDosen = checkRole('dosen');
const isAdmin = checkRole('admin');

// Export menggunakan kurung kurawal
module.exports = { isMahasiswa, isDosen, isAdmin };