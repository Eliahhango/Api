const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
	default: Eliah_Tech,
	useMultiFileAuthState,
	jidNormalizedUser,
	Browsers,
	delay,
	makeInMemoryStore,
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
	if (!fs.existsSync(FilePath)) return false;
	fs.rmSync(FilePath, {
		recursive: true,
		force: true
	})
};
const {
	readFile
} = require("node:fs/promises")
router.get('/', (req, res) => {
	res.sendFile(__dirname + '/eliahqr.html');
});

router.get('/qr', async (req, res) => {
	const id = makeid();
	async function ELIAH_MD_QR_CODE() {
		const {
			state,
			saveCreds
		} = await useMultiFileAuthState('./temp/' + id)
		try {
			let Qr_Code_By_Eliah_Tech = Eliah_Tech({
				auth: state,
				printQRInTerminal: false,
				logger: pino({
					level: "silent"
				}),
				browser: Browsers.macOS("Desktop"),
			});

			Qr_Code_By_Eliah_Tech.ev.on('creds.update', saveCreds)
			Qr_Code_By_Eliah_Tech.ev.on("connection.update", async (s) => {
				const {
					connection,
					lastDisconnect,
					qr
				} = s;
				if (qr) await res.end(await QRCode.toBuffer(qr));
				if (connection == "open") {
					await delay(5000);
					let data = await readFile(__dirname + `/temp/${id}/creds.json`);
					await delay(800);
				   let b64data = Buffer.from(data).toString('base64');
				   let session = await Qr_Code_By_Eliah_Tech.sendMessage(Qr_Code_By_Eliah_Tech.user.id, { text: '' + b64data });
	
				   let ELIAH_MD_TEXT = `
┏━━━━━━━━━━━━━━
┃*Enjoy using ELITECHWIZ*
┗━━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
|| Creator = ELITECHWIZ
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
▬▬▬▬▬▬
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
©*❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒

*ELITECHWIZ WHATSAPP SESSION IS CONNECTED*

❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒
~Follow this channel for bot updates~ 👇 👇 
> https://whatsapp.com/channel/0029VaeEYF0BvvsZpaTPfL2s

❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒
~For more info tap on the link below~ 
> https://github.com/Eliahhango 
> don't forget to fork and star the repo
❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒❒
 ~For any problem text developer~
> https://wa.me/255688164510
> https://wa.me/255617834510

*THIS BOT 🤖 MADE BY ELITECHWIZ*❒❒❒❒❒❒❒❒❒`;
	 await Qr_Code_By_Eliah_Tech.sendMessage(Qr_Code_By_Eliah_Tech.user.id,{text:ELIAH_MD_TEXT},{quoted:session})



					await delay(100);
					await Qr_Code_By_Eliah_Tech.ws.close();
					return await removeFile("temp/" + id);
				} else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
					await delay(10000);
					ELIAH_MD_QR_CODE();
				}
			});
		} catch (err) {
			if (!res.headersSent) {
				await res.json({
					code: "Service is Currently Unavailable"
				});
			}
			console.log(err);
			await removeFile("temp/" + id);
		}
	}
	return await ELIAH_MD_QR_CODE()
});
module.exports = router
