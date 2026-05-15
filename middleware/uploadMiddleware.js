const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder 'uploads' secara otomatis jika belum ada
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Tempat menyimpan file
    },
    filename: function (req, file, cb) {
        // Ganti nama file agar unik (menghindari nama file yang sama saling menimpa)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas maksimal file 5 MB
    fileFilter: (req, file, cb) => {
        // Hanya izinkan PDF
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Hanya file PDF yang diperbolehkan!'), false);
        }
    }
});

module.exports = upload;