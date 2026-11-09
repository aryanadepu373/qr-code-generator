const os = require("os");

// Interface names that are usually virtual and not reachable from a phone
const VIRTUAL_NAMES = /vmware|virtualbox|vbox|vethernet|hyper-v|wsl|docker|loopback|tailscale|zerotier|bluetooth/i;

// Returns the PC's local network IP (e.g. 192.168.1.5), or null if none found
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name] || []) {
            const isIPv4 = net.family === "IPv4" || net.family === 4;

            if (isIPv4 && !net.internal) {
                candidates.push({ name, address: net.address });
            }
        }
    }

    const real = candidates.filter((c) => !VIRTUAL_NAMES.test(c.name));

    const preferred =
        real.find((c) => c.address.startsWith("192.168.")) ||
        real.find((c) => c.address.startsWith("10.")) ||
        real[0] ||
        candidates[0];

    return preferred ? preferred.address : null;
}

module.exports = { getLocalIP };