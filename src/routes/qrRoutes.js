const express = require("express");
const multer = require("multer");
const router = express.Router();

const { generateQR, generateFileQR } = require("../controllers/qrController");
const { uploadSingle, MAX_FILE_SIZE } = require("../middleware/upload");

// Paste a link / text
router.post("/generate", generateQR);

// Upload a file (image, video, audio)
router.post(
    "/upload",
    (req, res, next) => {
        uploadSingle(req, res, (err) => {
            if (!err) return next();

            let message = err.message || "File upload failed.";

            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    message = `File is too large. Maximum size is ${
                        MAX_FILE_SIZE / (1024 * 1024)
                    } MB.`;
                } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    message = "Unexpected file field. Please upload one file.";
                }
            }

            return res.status(400).json({ success: false, message });
        });
    },
    generateFileQR
);

module.exports = router;