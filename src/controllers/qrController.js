const generateQRCode = require("../services/qrService");
const { saveText } = require("../services/textStore");
const { validateQRInput } = require("../utils/urlValidator");
const { getLocalIP } = require("../utils/network");

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"];

// Schemes that should go directly into the QR code (they open an app or site)
const DIRECT_SCHEMES = [
    "http:", "https:", "ftp:", "mailto:", "tel:", "sms:", "smsto:",
    "geo:", "whatsapp:", "upi:", "wifi:", "market:", "skype:", "zoommtg:"
];

// Builds the base URL used inside QR codes (file pages and text pages).
// Priority:
//   1. PUBLIC_BASE_URL environment variable
//   2. If opened via localhost, use the PC's LAN IP
//   3. Otherwise use the host the browser used (LAN IP, ngrok, domain)
function getBaseUrl(req) {
    if (process.env.PUBLIC_BASE_URL) {
        return process.env.PUBLIC_BASE_URL.replace(/\/+$/, "");
    }

    const host = req.get("host") || "";
    const hostname = host.replace(/:\d+$/, "");
    const portMatch = host.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : process.env.PORT || 3000;

    if (LOCAL_HOSTS.includes(hostname)) {
        const ip = getLocalIP();

        if (ip) {
            return `${req.protocol}://${ip}:${port}`;
        }
    }

    return `${req.protocol}://${host}`;
}

// Decides whether the input is a link / special format (goes directly into the QR)
// or plain text (saved and shown on a web page).
// Returns the value to put in the QR code, or null for plain text.
function getDirectValue(input) {
    // Contact cards and calendar events must stay as they are
    if (/^BEGIN:(VCARD|VEVENT)/i.test(input)) {
        return input;
    }

    // Links never contain spaces or line breaks
    if (/\s/.test(input)) {
        return null;
    }

    // "www.example.com" → add https://
    if (/^www\.[^\s.]+\.[^\s]+$/i.test(input)) {
        return "https://" + input;
    }

    try {
        const url = new URL(input);

        if (DIRECT_SCHEMES.includes(url.protocol.toLowerCase())) {
            return input;
        }
    } catch (error) {
        // not a URL → plain text
    }

    return null;
}

function isTooBigError(error) {
    return /too big|too long/i.test(error.message || "");
}

// POST /api/generate  → link or text
async function generateQR(req, res) {
    try {
        const body = req.body || {};
        const result = validateQRInput(body.text ?? body.url);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        const directValue = getDirectValue(result.value);

        // Links and special formats: the QR code contains the value itself
        if (directValue) {
            const qrCode = await generateQRCode(directValue);

            return res.status(200).json({
                success: true,
                message: "QR Code generated successfully!",
                type: "link",
                qrCode
            });
        }

        // Plain text: save it and put a page URL inside the QR code
        const id = await saveText(result.value);
        const pageUrl = `${getBaseUrl(req)}/t/${id}`;
        const qrCode = await generateQRCode(pageUrl);

        return res.status(200).json({
            success: true,
            message: "QR Code generated successfully!",
            type: "text",
            pageUrl,
            qrCode
        });
    } catch (error) {
        if (isTooBigError(error)) {
            return res.status(400).json({
                success: false,
                message: "Input is too large to fit in a QR code."
            });
        }

        console.error("QR Generation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while generating QR code."
        });
    }
}

// POST /api/upload  → image / video / audio file
async function generateFileQR(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please choose a file to upload."
            });
        }

        const fileUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
        const qrCode = await generateQRCode(fileUrl);

        const kind = req.file.mimetype.split("/")[0]; // image | video | audio

        return res.status(200).json({
            success: true,
            message: "File uploaded and QR Code generated successfully!",
            type: kind,
            fileUrl,
            originalName: req.file.originalname,
            qrCode
        });
    } catch (error) {
        console.error("File QR Generation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while generating QR code for the file."
        });
    }
}

module.exports = { generateQR, generateFileQR };