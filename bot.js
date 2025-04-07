const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  }
});

client.on('qr', qr => {
  console.log('⚠️ Scan QR berikut untuk login WhatsApp:');
  qrcode.generate(qr, { small: true });
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

  client.sendMessage(chatId, `Kode OTP kamu untuk login RizzShop adalah: *${otp}*`)
    .then(() => console.log(`✅ OTP terkirim ke ${chatId}`))
    .catch(err => console.error('❌ Gagal kirim OTP:', err.message));
}

module.exports = { sendOtp };
