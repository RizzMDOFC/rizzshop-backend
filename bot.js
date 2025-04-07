const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Pastikan folder session ada (untuk Railway dan sejenisnya)
fs.mkdirSync('./session', { recursive: true });

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'  // simpan session ke folder ini
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  }
});

client.on('qr', qr => {
  console.log('⚠️ Scan QR berikut untuk login WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('🔐 Autentikasi berhasil! Session tersimpan otomatis.');
});

client.on('auth_failure', msg => {
  console.error('❌ Autentikasi gagal:', msg);
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot Siap Kirim OTP!');
});

client.initialize();

function sendOtp(phone, otp) {
  const cleaned = phone.replace(/\D/g, '');
  const normalized = cleaned.startsWith('0') ? '62' + cleaned.slice(1) : cleaned;
  const chatId = `${normalized}@c.us`;

  console.log('➡️ Mengirim OTP ke', chatId);

  client.sendMessage(chatId, `🔐 OTP untuk login RizzShop:\n\n*${otp}*\n\n > 📌 Kode ini berlaku 5 menit.\n\n_Salin manual kode di atas ke aplikasi._`)
    .then(() => console.log(`✅ OTP terkirim ke ${chatId}`))
    .catch(err => console.error('❌ Gagal kirim OTP:', err.message));
}

module.exports = { sendOtp };
