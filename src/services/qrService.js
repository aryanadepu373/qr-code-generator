const QRCode = require("qrcode");

async function generateQRCode(data) {
    // "M" error correction gives more data capacity than "H",
    // which matters now that long links and text are allowed.
    return QRCode.toDataURL(data, {
        errorCorrectionLevel: "M",
        type: "image/png",
        width: 300,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF"
        }
    });
}

module.exports = generateQRCode;