const PastebinAPI = require("pastebin-js")
const pastebin = new PastebinAPI("EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL")
const { makeid } = require("./id")
const express = require("express")
const fs = require("fs")
const router = express.Router()
const pino = require("pino")
const {
  default: EliTechWiz,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers,
} = require("@whiskeysockets/baileys")

function removeFile(filePath) {
  if (!fs.existsSync(filePath)) return false
  fs.rmSync(filePath, { recursive: true, force: true })
}

async function createPairCode(sessionId, phoneNumber) {
  const { state, saveCreds } = await useMultiFileAuthState("./temp/" + sessionId)

  try {
    const sock = EliTechWiz({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }).child({ level: "fatal" }),
      browser: Browsers.macOS("Chrome"),
    })

    if (!sock.authState.creds.registered) {
      await delay(1500)
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
      const code = await sock.requestPairingCode(phoneNumber)
      return code
    }

    sock.ev.on("creds.update", saveCreds)
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update

      if (connection == "open") {
        await delay(5000)
        const sessionData = fs.readFileSync(__dirname + "/temp/" + sessionId + "/creds.json")
        await delay(800)
        const base64data = Buffer.from(sessionData).toString("base64")
        const sessionMessage = await sock.sendMessage(sock.user.id, { text: "" + base64data })

        const audioUrl = "https://files.catbox.moe/7ocmby.jpg"
        const imageUrl = "https://files.catbox.moe/mjr4th.jpg"
        const welcomeText = `❖
┋□ 🕵️ *ɴᴀᴍᴇ : ᴇʟɪᴛᴇᴄʜᴡɪᴢ*
┋□ 🍴 *ᴇʟɪᴛᴇᴄʜᴡɪᴢ-ᴡᴀʙᴏᴛ sᴇssɪᴏɴ ᴄᴏɴɴᴇᴄᴛᴇᴅ*

╭─❖
┋□ 🌟 *GitHub* https://github.com/Eliahhango/EliTechWiz-V4 
┋□ 🍴fork *[100k]* 🌟 star *[200k]*
╰─❖

*EliTechWiz*

Message via https://whatsapp.com/channel/0029VaeEYF0BvvsZpaTPfL2s

*GitHub* https://github.com/Eliahhango/EliTechWiz-V4
*[1]* 🍴fork *[100k]* 🌟 star *[200k]*
╰─❖

EliTechWiz`

        await sock.sendMessage(
          sock.user.id,
          {
            image: { url: imageUrl },
            text: welcomeText,
            contextInfo: {
              externalAdReply: {
                title: "EliTechWiz",
                body: "EliTechWiz Session Generator",
                thumbnailUrl: imageUrl,
                sourceUrl: imageUrl,
                mediaType: 1,
                showAdAttribution: true,
              },
            },
          },
          { quoted: sessionMessage },
        )

        await sock.sendMessage(
          sock.user.id,
          {
            audio: { url: audioUrl },
            mimetype: "audio/mp4",
            ptt: true,
            contextInfo: {
              externalAdReply: {
                title: "EliTechWiz",
                body: "EliTechWiz Session Generator",
                thumbnailUrl: imageUrl,
                sourceUrl: imageUrl,
                mediaType: 1,
                showAdAttribution: true,
              },
            },
          },
          { quoted: sessionMessage },
        )

        await delay(100)
        await sock.ws.close()
        await removeFile("./temp/" + sessionId)
      } else if (
        connection === "close" &&
        lastDisconnect &&
        lastDisconnect.error &&
        lastDisconnect.error.output.statusCode != 401
      ) {
        await delay(10000)
        return await createPairCode(sessionId, phoneNumber)
      }
    })
  } catch (err) {
    console.log("Service Unavailable")
    await removeFile("./temp/" + sessionId)
    return "Service Unavailable"
  }
}

router.get("/", async (req, res) => {
  const sessionId = makeid()
  const phoneNumber = req.query.number

  const code = await createPairCode(sessionId, phoneNumber)
  if (!res.headersSent) {
    await res.send({ code: code })
  }
})

module.exports = router
