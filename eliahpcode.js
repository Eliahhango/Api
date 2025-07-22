const express = require('express');
const fs = require('fs');
const { makeid } = require('./id');
const pino = require('pino');
const {
  default: Eliah_Tech,
  useMultiFileAuthState,
  Browsers,
  delay
} = require('@whiskeysockets/baileys');
const { readFile } = require('node:fs/promises');

const router = express.Router();

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, {
    recursive: true,
    force: true
  });
}

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/eliahpcode.html');
});

router.get('/code', async (req, res) => {
  const id = makeid();
  let phoneNumber = req.query.number;
  if (!phoneNumber || phoneNumber.length < 11) {
    return res.status(400).json({ error: 'Invalid phone number. Please provide the full number with country code.' });
  }
  phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  async function ELIAH_MD_PAIRING_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    try {
      let PairingSock = Eliah_Tech({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'),
      });
      PairingSock.ev.on('creds.update', saveCreds);
      PairingSock.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection === 'open') {
          await delay(5000);
          let data = await readFile(__dirname + `/temp/${id}/creds.json`);
          await delay(800);
          let b64data = Buffer.from(data).toString('base64');
          let session = await PairingSock.sendMessage(PairingSock.user.id, { text: '' + b64data });
          let ELITECHWIZ_MSG = `\n┏━━━━━━━━━━━━━━\n┃*Enjoy using ELITECHWIZ*\n┗━━━━━━━━━━━━━━━\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n|| Creator = ELITECHWIZ\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n▬▬▬▬▬▬\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n©*❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒\n\n*ELITECHWIZ WHATSAPP SESSION IS CONNECTED*\n\n❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒\n~Follow this channel for bot updates~ 👇 👇 \n> https://whatsapp.com/channel/0029VaeEYF0BvvsZpaTPfL2s\n\n❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒\n~For more info tap on the link below~ \n> https://github.com/Eliahhango \n> don't forget to fork and star the repo\n❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒\n ~For any problem text developer~\n> https://wa.me/255688164510\n> https://wa.me/255617834510\n\n*THIS BOT 🤖 MADE BY ELITECHWIZ*❒❒❒❒❒❒❒❒❒`;
          await PairingSock.sendMessage(PairingSock.user.id, { text: ELITECHWIZ_MSG }, { quoted: session });
          await delay(100);
          await PairingSock.ws.close();
          return await removeFile('temp/' + id);
        } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
          await delay(10000);
          ELIAH_MD_PAIRING_CODE();
        }
      });
      // Request pairing code
      await delay(1500);
      const pairingCode = await PairingSock.requestPairingCode(phoneNumber);
      res.status(200).json({ code: pairingCode.replace(/([0-9]{4})/g, '$1-').slice(0, -1) });
    } catch (err) {
      if (!res.headersSent) {
        await res.json({ code: 'Service is Currently Unavailable' });
      }
      console.log(err);
      await removeFile('temp/' + id);
    }
  }
  return await ELIAH_MD_PAIRING_CODE();
});

module.exports = router; 