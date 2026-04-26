// ===============================
// AI CHATBOT + WHATSAPP WEBHOOK
// ===============================

require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ===============================
// CONFIG (ambil dari .env)
// ===============================
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ===============================
// ENDPOINT AI (CHAT)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // 🔥 GANTI INI dengan AI kamu (OpenAI / custom)
    let reply;

    if (!userMessage) {
      reply = "Pesan kosong.";
    } else {
      // contoh AI sederhana
      reply = `🤖 AI: ${userMessage}`;
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Terjadi error di AI." });
  }
});

// ===============================
// VERIFIKASI WEBHOOK (META)
// ===============================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  } else {
    console.log("❌ Webhook verification failed");
    return res.sendStatus(403);
  }
});

// ===============================
// TERIMA PESAN DARI WHATSAPP
// ===============================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body;

      console.log("📩 Pesan masuk:", text);

      // ===============================
      // KIRIM KE AI
      // ===============================
      const aiRes = await axios.post(
        "http://localhost:3000/api/chat",
        {
          message: text,
        }
      );

      const reply = aiRes.data.reply;

      console.log("🤖 Balasan AI:", reply);

      // ===============================
      // KIRIM BALASAN KE WHATSAPP
      // ===============================
      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server jalan di port ${PORT}`);
});
