// Validates generic text/link input for QR generation.
// No longer limited to HTTP/HTTPS: any non-empty text is allowed.

const MAX_TEXT_LENGTH = 2000;

function validateQRInput(input) {
    if (typeof input !== "string") {
        return { valid: false, message: "Please enter a link or text." };
    }

    const trimmed = input.trim();

    if (!trimmed) {
        return { valid: false, message: "Please enter a link or text." };
    }

    if (trimmed.length > MAX_TEXT_LENGTH) {
        return {
            valid: false,
            message: `Input is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`
        };
    }

    return { valid: true, value: trimmed };
}

module.exports = { validateQRInput, MAX_TEXT_LENGTH };