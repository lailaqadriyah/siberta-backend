const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ pesan: "Akses ditolak! Token tidak ditemukan." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next(); 
    } catch (error) {
        res.status(400).json({ pesan: "Token tidak valid atau sudah kedaluwarsa!" });
    }
};

module.exports = { verifyToken };