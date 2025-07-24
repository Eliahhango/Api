const express = require("express")
const fs = require("fs")
const path = require("path")
const { makeid } = require("./id")
const pino = require("pino")
const {
  default: Eliah_Tech,
  useMultiFileAuthState,
  Browsers,
  delay,
  DisconnectReason,
} = require("@whiskeysockets/baileys")
const { readFile } = require("node:fs/promises")

const router = express.Router()

// Ensure temp directory exists
const tempDir = path.join(__dirname, "temp")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false
  try {
    fs.rmSync(FilePath, {
      recursive: true,
      force: true,
    })
    return true
  } catch (error) {
    console.error("Error removing file:", error)
    return false
  }
}

router.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "eliahpcode.html")
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath)
  } else {
    res.status(404).send("Pairing code page not found")
  }
})

router.get("/code", async (req, res) => {
  const id = makeid()
  let phoneNumber = req.query.number
  const sessionPath = path.join(tempDir, id)
  let PairingSock
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  if (!phoneNumber || phoneNumber.length < 11) {
    return res.status(400).json({
      error: "Invalid phone number. Please provide the full number with country code.",
      code: "Service is Currently Unavailable",
    })
  }

  phoneNumber = phoneNumber.replace(/[^0-9]/g, "")

  async function ELIAH_MD_PAIRING_CODE() {
    PairingSock = Eliah_Tech({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Desktop"),
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 10000,
      emitOwnEvents: false,
      fireInitQueries: true,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: true,
    })

    PairingSock.ev.on("creds.update", saveCreds)

    PairingSock.ev.on("connection.update", async (s) => {
      const { connection, lastDisconnect } = s

      if (connection === "open") {
        try {
          await delay(5000)
          const credsPath = path.join(sessionPath, "creds.json")

          if (fs.existsSync(credsPath)) {
            const data = await readFile(credsPath)
            await delay(800)
            const b64data = Buffer.from(data).toString("base64")
            const session = await PairingSock.sendMessage(PairingSock.user.id, { text: "" + b64data })

            const ELITECHWIZ_MSG = `
┏━━━━━━━━━━━━━━
┃*Enjoy using ELITECHWIZ*
┗━━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
|| Creator = ELITECHWIZ
▬▬▬▬▬▬▬▬▬▬▬▬▬▬

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

*THIS BOT 🤖 MADE BY ELITECHWIZ*❒❒❒❒❒❒❒❒❒`
            await PairingSock.sendMessage(PairingSock.user.id, { text: ELITECHWIZ_MSG }, { quoted: session })
          }
        } catch (error) {
          console.error("Error sending session data:", error)
        } finally {
          await delay(100)
          if (PairingSock.ws) {
            await PairingSock.ws.close()
          }
          removeFile(sessionPath)
        }
      } else if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

        if (shouldReconnect && lastDisconnect?.error?.output?.statusCode !== 401) {
          console.log("Connection closed, attempting to reconnect...")
          await delay(10000)
          ELIAH_MD_PAIRING_CODE()
        } else {
          removeFile(sessionPath)
        }
      }
    })

    // Request pairing code with timeout
    await delay(1500)
    const pairingCode = await Promise.race([
      PairingSock.requestPairingCode(phoneNumber),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Pairing code request timeout")), 30000)),
    ])

    if (pairingCode && !res.headersSent) {
      const formattedCode = pairingCode.replace(/([0-9]{4})/g, "$1-").slice(0, -1)
      res.status(200).json({ code: formattedCode })
    }
  }

  return await ELIAH_MD_PAIRING_CODE()
})

module.exports = router
