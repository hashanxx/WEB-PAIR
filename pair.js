const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
} = require("@whiskeysockets/baileys");
const { upload } = require("./mega");

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get("/", async (req, res) => {
  let num = req.query.number;
  async function LunaPair() {
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    try {
      let LunaPairWeb = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
        browser: Browsers.macOS("Safari"),
      });

      if (!LunaPairWeb.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, "");
        const code = await LunaPairWeb.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      LunaPairWeb.ev.on("creds.update", saveCreds);
      LunaPairWeb.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection === "open") {
          try {
            await delay(10000);
            const sessionHashan = fs.readFileSync("./session/creds.json");

            const auth_path = "./session/";
            const user_jid = jidNormalizedUser(Luna=PairWeb.user.id);

            function randomMegaId(length = 6, numberLength = 4) {
              const characters =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
              let result = "";
              for (let i = 0; i < length; i++) {
                result += characters.charAt(
                  Math.floor(Math.random() * characters.length)
                );
              }
              const number = Math.floor(
                Math.random() * Math.pow(10, numberLength)
              );
              return `${result}${number}`;
            }

            const mega_url = await upload(
              fs.createReadStream(auth_path + "creds.json"),
              `${randomMegaId()}.json`
            );

            const string_session = mega_url.replace(
              "https://mega.nz/file/",
              ""
            );

            const sid = `*💖 𝙿 𝚁 𝙸 𝙽 𝙲 𝙴 𝚂 𝚂    𝙻 𝚄 𝙽 𝙰 💖*\n\n👉 ${string_session} 👈\n\n*This is the your Session ID, copy this id and paste into config.js file*\n\n*You can ask any question using this link*\n\n*https://chat.whatsapp.com/IxUX7F1W6k6AlrbRuEzNik*\n\n*You can join my whatsapp channel*\n\n*https://whatsapp.com/channel/0029VbAxbzyK0IBoK7GPrO2L*`;
            const mg = `🛑 *Do not share this code to anyone* 🛑`;
            const dt = await LunaPairWeb.sendMessage(user_jid, {
              image: {
                url: "https://raw.githubusercontent.com/hashanxx/Luna-MD-IMAGE2/refs/heads/main/luna%20mdff.jpg",
              },
              caption: sid,
            });
            const msg = await LunaPairWeb.sendMessage(user_jid, {
              text: string_session,
            });
            const msg1 = await LunaPairWeb.sendMessage(user_jid, { text: mg });
          } catch (e) {
            exec("pm2 restart luna");
          }

          await delay(100);
          return await removeFile("./session");
          process.exit(0);
        } else if (
          connection === "close" &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode !== 401
        ) {
          await delay(10000);
          LunaPair();
        }
      });
    } catch (err) {
      exec("pm2 restart Luna-md");
      console.log("service restarted");
      LunaPair();
      await removeFile("./session");
      if (!res.headersSent) {
        await res.send({ code: "Service Unavailable" });
      }
    }
  }
  return await LunaPair();
});

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
  exec("pm2 restart Luna");
});

module.exports = router;
