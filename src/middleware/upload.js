const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

// Create the uploads folder if it doesn't exist
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Allowed file families
const ALLOWED_PREFIXES = ["image/", "video/", "audio/"];

// SVG can contain scripts, so we block it
const BLOCKED_TYPES = ["image/svg+xml"];

// 50 MB limit
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Random name so users can't overwrite or guess other files
        let ext = path.extname(file.originalname).toLowerCase();

        if (!/^\.[a-z0-9]{1,8}$/.test(ext)) {
            ext = "";
        }

        const randomName = crypto.randomBytes(16).toString("hex");
        cb(null, randomName + ext);
    }
});

function fileFilter(req, file, cb) {
    const type = file.mimetype;

    const allowed =
        ALLOWED_PREFIXES.some((prefix) => type.startsWith(prefix)) &&
        !BLOCKED_TYPES.includes(type);

    if (!allowed) {
        return cb(
            new Error("Only image, video and audio files are allowed.")
        );
    }

    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
});

module.exports = {
    uploadSingle: upload.single("file"),
    UPLOAD_DIR,
    MAX_FILE_SIZE
};