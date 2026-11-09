// Escapes user text so it can never run as HTML or script
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderTextPage(text) {
    const safeText = escapeHtml(text);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shared Text</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .card {
            width: 100%;
            max-width: 600px;
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }
        h1 { font-size: 20px; color: #764ba2; margin-bottom: 18px; }
        .text {
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            font-size: 17px;
            line-height: 1.6;
            color: #222;
            background: #f7f7fb;
            border-radius: 10px;
            padding: 18px;
        }
        button {
            width: 100%;
            margin-top: 20px;
            padding: 14px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Your Text</h1>
        <div class="text" id="content">${safeText}</div>
        <button type="button" id="copyBtn">Copy Text</button>
    </div>

    <script>
        document.getElementById("copyBtn").addEventListener("click", function () {
            var btn = this;
            var text = document.getElementById("content").textContent;

            function done() {
                btn.textContent = "Copied!";
                setTimeout(function () { btn.textContent = "Copy Text"; }, 1500);
            }

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(done);
            } else {
                var area = document.createElement("textarea");
                area.value = text;
                document.body.appendChild(area);
                area.select();
                document.execCommand("copy");
                document.body.removeChild(area);
                done();
            }
        });
    </script>
</body>
</html>`;
}

function renderNotFoundPage() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center;
               align-items: center; min-height: 100vh; background: #f1f1f5; color: #333; }
    </style>
</head>
<body>
    <h2>This text was not found.</h2>
</body>
</html>`;
}

module.exports = { renderTextPage, renderNotFoundPage };