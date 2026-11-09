const express = require("express");
const path = require("path");

const qrRoutes = require("./src/routes/qrRoutes");
const { UPLOAD_DIR } = require("./src/middleware/upload");
const { getLocalIP } = require("./src/utils/network");
const { getText } = require("./src/services/textStore");
const { renderTextPage, renderNotFoundPage } = require("./src/views/textPage");

const app = express();

const PORT = process.env.PORT || 3000;

// Needed so req.protocol is "https" when running behind ngrok / a hosting proxy
app.set("trust proxy", true);

// Middleware
app.use(express.json({ limit: "10kb" }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files (these are the URLs the QR codes point to)
app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
        setHeaders: (res) => {
            res.setHeader("X-Content-Type-Options", "nosniff");
        }
    })
);

// Page that shows the saved text when the QR code is scanned
app.get("/t/:id", async (req, res) => {
    const text = await getText(req.params.id);

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");

    if (text === null) {
        return res.status(404).type("html").send(renderNotFoundPage());
    }

    res.status(200).type("html").send(renderTextPage(text));
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "QR Code Generator Server is running!"
    });
});

// QR API routes
app.use("/api", qrRoutes);

// Handle unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Start server on all network interfaces so phones on the same Wi-Fi can connect
app.listen(PORT, "0.0.0.0", () => {
    const ip = getLocalIP();

    console.log(`Server running at http://localhost:${PORT}`);

    if (ip) {
        console.log(`On your network:   http://${ip}:${PORT}  (phones on the same Wi-Fi can use this)`);
    } else {
        console.log("Could not detect a local network IP. Connect to Wi-Fi/LAN and restart.");
    }
});