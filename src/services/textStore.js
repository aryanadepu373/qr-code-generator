const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TEXT_DIR = path.join(__dirname, "..", "..", "texts");

// Create the texts folder if it doesn't exist
fs.mkdirSync(TEXT_DIR, { recursive: true });

const ID_PATTERN = /^[a-f0-9]{32}$/;

// Saves text and returns a random id
async function saveText(text) {
    const id = crypto.randomBytes(16).toString("hex");
    const data = JSON.stringify({ text, createdAt: new Date().toISOString() });

    await fs.promises.writeFile(path.join(TEXT_DIR, id + ".json"), data, "utf8");

    return id;
}

// Returns the saved text, or null if the id is invalid / not found
async function getText(id) {
    if (!ID_PATTERN.test(id)) return null;

    try {
        const raw = await fs.promises.readFile(
            path.join(TEXT_DIR, id + ".json"),
            "utf8"
        );
        return JSON.parse(raw).text;
    } catch (error) {
        return null;
    }
}

module.exports = { saveText, getText, TEXT_DIR };