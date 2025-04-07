const express = require('express');
const session = require('cookie-session');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { sendOtp } = require('./bot');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  name: 'rizzshop-session',
  keys: ['secretkey'],
  maxAge: 24 * 60 * 60 * 1000
}));

const usersPath = path.join(__dirname, 'users.json');
const otpPath = path.join(__dirname, 'otp.json');

const readJSON = (file) => JSON.parse(fs.existsSync(file) ? fs.readFileSync(file) : '{}');
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/send-otp', (req, res) => {
  const { phone, mode } = req.body;
  console.log('📩 Kirim OTP ke:', phone, '| Mode:', mode);

  if (!phone || !mode) return res.status(400).send('Nomor dan mode wajib diisi');

  const otp = generateOtp();
  const otpData = readJSON(otpPath);
  otpData[phone] = otp;
  writeJSON(otpPath, otpData);

  sendOtp(phone, otp);
  res.json({ success: true, message: 'OTP dikirim ke WhatsApp!' });
});

app.post('/verify-otp', (req, res) => {
  const { phone, otp, password, mode } = req.body;
  const users = readJSON(usersPath);
  const otps = readJSON(otpPath);

  if (otps[phone] !== otp) {
    return res.json({ success: false, message: 'OTP salah atau kadaluarsa' });
  }

  if (mode === 'signup') {
    if (users[phone]) {
      return res.json({ success: false, message: 'Nomor sudah terdaftar' });
    }
    if (!password) {
      return res.json({ success: false, message: 'Password wajib diisi' });
    }

    users[phone] = { phone, password };
    writeJSON(usersPath, users);
  }

  if (mode === 'login') {
    if (!users[phone] || users[phone].password !== password) {
      return res.json({ success: false, message: 'Nomor atau password salah' });
    }
  }

  delete otps[phone];
  writeJSON(otpPath, otps);

  req.session.user = phone;
  res.json({ success: true });
});

app.get('/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RizzShop running on http://localhost:${PORT}`);
});
