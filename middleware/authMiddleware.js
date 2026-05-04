const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Mengambil token dari header request
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ pesan: "Akses ditolak! Token tidak ditemukan." });
    }

    // Biasanya format token adalah "Bearer <token_acak>"
    const token = authHeader.split(' ')[1];

    try {
        // Cek keaslian token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Simpan data user ke dalam request untuk dipakai nanti
        next(); // Lanjut ke proses berikutnya (controller)
    } catch (error) {
        res.status(400).json({ pesan: "Token tidak valid atau sudah kedaluwarsa!" });
    }
};

module.exports = verifyToken;