// ---------- Select HTML elements ----------

const tabLink = document.getElementById("tabLink");
const tabFile = document.getElementById("tabFile");

const linkForm = document.getElementById("linkForm");
const fileForm = document.getElementById("fileForm");

const linkInput = document.getElementById("linkInput");
const fileInput = document.getElementById("fileInput");

const generateBtn = document.getElementById("generateBtn");
const uploadBtn = document.getElementById("uploadBtn");

const qrSection = document.getElementById("qrSection");
const qrImage = document.getElementById("qrImage");
const qrDescription = document.getElementById("qrDescription");
const fileLink = document.getElementById("fileLink");

const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");

const message = document.getElementById("message");

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB


// ---------- Helpers ----------

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function resetResult() {
    qrImage.removeAttribute("src");
    downloadBtn.removeAttribute("href");
    fileLink.classList.add("hidden");
    fileLink.removeAttribute("href");
    qrSection.classList.add("hidden");
    message.textContent = "";
    message.className = "message";
}

function showResult(data) {
    qrImage.src = data.qrCode;

    downloadBtn.href = data.qrCode;
    downloadBtn.download = "my-qrcode.png";

    if (data.fileUrl) {
        // Uploaded file
        qrDescription.textContent =
            "Scan this QR code to open your " + data.type + " file.";
        fileLink.textContent = "Open uploaded file";
        fileLink.href = data.fileUrl;
        fileLink.classList.remove("hidden");

    } else if (data.pageUrl) {
        // Plain text → shown on a web page
        qrDescription.textContent =
            "Scan this QR code to view your text on a web page.";
        fileLink.textContent = "Open text page";
        fileLink.href = data.pageUrl;
        fileLink.classList.remove("hidden");

    } else {
        // Direct link / special format
        qrDescription.textContent = "Scan this QR code using your smartphone.";
        fileLink.classList.add("hidden");
    }

    qrSection.classList.remove("hidden");
    showMessage(data.message || "QR Code generated successfully!", "success");
}


// ---------- Tab switching ----------

function switchMode(mode) {
    const isLink = mode === "link";

    tabLink.classList.toggle("active", isLink);
    tabFile.classList.toggle("active", !isLink);

    linkForm.classList.toggle("hidden", !isLink);
    fileForm.classList.toggle("hidden", isLink);

    resetResult();
}

tabLink.addEventListener("click", () => switchMode("link"));
tabFile.addEventListener("click", () => switchMode("file"));


// ---------- Option 1: Link / Text ----------

linkForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const text = linkInput.value.trim();

    if (!text) {
        showMessage("Please enter a link or text.", "error");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    resetResult();

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "QR generation failed.");
        }

        showResult(data);

    } catch (error) {
        showMessage(
            error.message || "Unable to connect to the server.",
            "error"
        );
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate QR Code";
    }
});


// ---------- Option 2: File upload ----------

fileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const file = fileInput.files[0];

    if (!file) {
        showMessage("Please choose a file to upload.", "error");
        return;
    }

    const okType =
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/");

    if (!okType || file.type === "image/svg+xml") {
        showMessage("Only image, video and audio files are allowed.", "error");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        showMessage("File is too large. Maximum size is 50 MB.", "error");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";
    resetResult();

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Upload failed.");
        }

        showResult(data);

    } catch (error) {
        showMessage(
            error.message || "Unable to connect to the server.",
            "error"
        );
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload & Generate QR Code";
    }
});


// ---------- Clear ----------

clearBtn.addEventListener("click", function () {
    linkInput.value = "";
    fileInput.value = "";
    resetResult();
});