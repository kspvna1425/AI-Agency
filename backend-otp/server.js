import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_HASH_SALT = process.env.EMAIL_HASH_SALT || 'default_dev_salt_change_in_prod';
const ADMIN_EMAIL_HASH = process.env.ADMIN_EMAIL_HASH;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!JWT_SECRET || !ADMIN_EMAIL_HASH || !ADMIN_PASSWORD_HASH) {
  console.error('ERROR: Missing JWT_SECRET, ADMIN_EMAIL_HASH, or ADMIN_PASSWORD_HASH in .env');
  process.exit(1);
}

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const REQUESTS_FILE = path.join(__dirname, 'data', 'requests.json');

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH'],
  })
);
app.use(express.json({ limit: '50kb' }));

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP/login attempts. Please wait 15 minutes.' },
});

const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
const mailTransporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

async function sendOtpEmail(toEmail, otpCode, purpose) {
  const subject =
    purpose === 'reset'
      ? `Password Reset OTP: ${otpCode} — AetherFlow.ai`
      : `Verify Your Email OTP: ${otpCode} — AetherFlow.ai`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#0f172a;margin-bottom:8px;">AetherFlow.ai Verification</h2>
      <p style="color:#475569;font-size:14px;">
        ${
          purpose === 'reset'
            ? 'Use the 6-digit OTP below to reset your account password:'
            : 'Use the 6-digit OTP below to verify your email and activate your account:'
        }
      </p>
      <div style="font-size:32px;font-weight:800;letter-spacing:6px;color:#2563eb;background:#eff6ff;padding:16px;text-align:center;border-radius:10px;margin:18px 0;">
        ${otpCode}
      </div>
      <p style="color:#64748b;font-size:12px;">This OTP expires in 10 minutes. Never share this code with anyone.</p>
    </div>
  `;

  if (mailTransporter) {
    await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject,
      html,
    });
    return { sentViaSmtp: true };
  } else {
    console.log(`[DEV OTP PREVIEW] Email: ${toEmail} | Purpose: ${purpose} | OTP: ${otpCode}`);
    return { sentViaSmtp: false, devOtp: otpCode };
  }
}

function hashEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return crypto.createHmac('sha256', EMAIL_HASH_SALT).update(normalized).digest('hex');
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
}

function generateSixDigitOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function sanitizeText(val, maxLen = 1000) {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>]/g, '').trim().slice(0, maxLen);
}

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access denied.' });
  }
  next();
}

app.post('/api/auth/signup', otpLimiter, async (req, res) => {
  const fullName = sanitizeText(req.body.fullName, 100);
  const email = sanitizeText(req.body.email, 150).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!fullName || !email || !email.includes('@') || password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Full name, valid email, and password (min 6 chars) are required.' });
  }

  const emailHash = hashEmail(email);
  const users = await readJsonArray(USERS_FILE);

  const existing = users.find((u) => u.emailHash === emailHash);
  if (existing && existing.emailVerified) {
    return res.status(409).json({ error: 'Account already exists and is verified. Please Sign In.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateSixDigitOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = Date.now() + 10 * 60 * 1000;

  let targetUser;
  if (existing && !existing.emailVerified) {
    existing.fullName = fullName;
    existing.passwordHash = passwordHash;
    existing.signupOtpHash = otpHash;
    existing.signupOtpExpiresAt = otpExpiresAt;
    targetUser = existing;
  } else {
    targetUser = {
      userId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      emailHash,
      passwordHash,
      emailVerified: false,
      signupOtpHash: otpHash,
      signupOtpExpiresAt: otpExpiresAt,
      role: 'client',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    users.unshift(targetUser);
  }

  await writeJsonArray(USERS_FILE, users);
  const mailResult = await sendOtpEmail(email, otp, 'signup');

  res.status(201).json({
    requiresOtp: true,
    message: mailResult.sentViaSmtp
      ? '6-digit verification OTP sent to your email.'
      : 'SMTP not configured yet — use the dev OTP shown below to test.',
    devOtp: mailResult.devOtp || null,
  });
});

app.post('/api/auth/verify-signup-otp', otpLimiter, async (req, res) => {
  const email = sanitizeText(req.body.email, 150).toLowerCase();
  const otp = String(req.body.otp || '').trim();

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit OTP are required.' });
  }

  const emailHash = hashEmail(email);
  const otpHash = hashOtp(otp);
  const users = await readJsonArray(USERS_FILE);

  const user = users.find((u) => u.emailHash === emailHash);
  if (!user) return res.status(404).json({ error: 'Account not found.' });

  if (user.signupOtpHash !== otpHash || Number(user.signupOtpExpiresAt || 0) < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }

  user.emailVerified = true;
  user.lastLogin = new Date().toISOString();
  delete user.signupOtpHash;
  delete user.signupOtpExpiresAt;
  await writeJsonArray(USERS_FILE, users);

  const token = jwt.sign(
    { userId: user.userId, emailHash: user.emailHash, role: 'client' },
    JWT_SECRET,
    { expiresIn: '2d' }
  );

  res.json({
    token,
    user: {
      userId: user.userId,
      fullName: user.fullName,
      emailVerified: true,
      role: 'client',
    },
  });
});

app.post('/api/auth/login', otpLimiter, async (req, res) => {
  const email = sanitizeText(req.body.email, 150).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  const emailHash = hashEmail(email);
  const users = await readJsonArray(USERS_FILE);
  const user = users.find((u) => u.emailHash === emailHash);

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isPassValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPassValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.emailVerified) {
    const otp = generateSixDigitOtp();
    user.signupOtpHash = hashOtp(otp);
    user.signupOtpExpiresAt = Date.now() + 10 * 60 * 1000;
    await writeJsonArray(USERS_FILE, users);
    const mailResult = await sendOtpEmail(email, otp, 'signup');
    return res.status(403).json({
      requiresOtp: true,
      error: 'Email not verified yet. A fresh 6-digit OTP has been sent to your email.',
      devOtp: mailResult.devOtp || null,
    });
  }

  user.lastLogin = new Date().toISOString();
  await writeJsonArray(USERS_FILE, users);

  const token = jwt.sign(
    { userId: user.userId, emailHash: user.emailHash, role: 'client' },
    JWT_SECRET,
    { expiresIn: '2d' }
  );

  res.json({
    token,
    user: {
      userId: user.userId,
      fullName: user.fullName,
      emailVerified: true,
      role: 'client',
    },
  });
});

app.post('/api/auth/forgot-password', otpLimiter, async (req, res) => {
  const email = sanitizeText(req.body.email, 150).toLowerCase();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid registered email.' });
  }

  const emailHash = hashEmail(email);
  const users = await readJsonArray(USERS_FILE);
  const user = users.find((u) => u.emailHash === emailHash);

  if (!user) return res.status(404).json({ error: 'No account found with this email.' });

  const resetOtp = generateSixDigitOtp();
  user.resetOtpHash = hashOtp(resetOtp);
  user.resetOtpExpiresAt = Date.now() + 10 * 60 * 1000;
  await writeJsonArray(USERS_FILE, users);

  const mailResult = await sendOtpEmail(email, resetOtp, 'reset');

  res.json({
    sent: true,
    message: mailResult.sentViaSmtp
      ? 'Password reset OTP sent to your email.'
      : 'SMTP not configured yet — use the dev reset OTP shown below.',
    devOtp: mailResult.devOtp || null,
  });
});

app.post('/api/auth/reset-password', otpLimiter, async (req, res) => {
  const email = sanitizeText(req.body.email, 150).toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

  if (!email || !otp || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: 'Email, 6-digit OTP, and new password (min 6 chars) are required.' });
  }

  const emailHash = hashEmail(email);
  const otpHash = hashOtp(otp);
  const users = await readJsonArray(USERS_FILE);
  const user = users.find((u) => u.emailHash === emailHash);

  if (!user) return res.status(404).json({ error: 'Account not found.' });

  if (user.resetOtpHash !== otpHash || Number(user.resetOtpExpiresAt || 0) < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired reset OTP.' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.emailVerified = true;
  user.passwordUpdatedAt = new Date().toISOString();
  delete user.resetOtpHash;
  delete user.resetOtpExpiresAt;
  await writeJsonArray(USERS_FILE, users);

  res.json({
    success: true,
    message: 'Password updated securely (bcrypt hashed) in backend! You can now sign in.',
  });
});

app.post('/api/admin/login', otpLimiter, async (req, res) => {
  const email = sanitizeText(req.body.email, 150).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (hashEmail(email) !== ADMIN_EMAIL_HASH) {
    return res.status(401).json({ error: 'Unauthorized admin credentials.' });
  }

  const isAdminPassValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isAdminPassValid) {
    return res.status(401).json({ error: 'Unauthorized admin credentials.' });
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, admin: { role: 'admin' } });
});

app.post('/api/requests', async (req, res) => {
  const name = sanitizeText(req.body.name, 100);
  const email = sanitizeText(req.body.email, 150).toLowerCase();
  const service = sanitizeText(req.body.service, 80);
  const budget = sanitizeText(req.body.budget, 60);
  const brief = sanitizeText(req.body.brief, 2000);
  const userId = sanitizeText(req.body.userId, 40) || `GUEST-${Math.floor(100 + Math.random() * 899)}`;

  if (!name || !email || !service || !brief) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  const requests = await readJsonArray(REQUESTS_FILE);
  const newReq = {
    id: `REQ-${Math.floor(2000 + Math.random() * 8000)}`,
    userId,
    name,
    emailHash: hashEmail(email),
    service,
    budget,
    brief,
    status: 'New',
    progress: 10,
    createdAt: new Date().toISOString(),
  };

  requests.unshift(newReq);
  await writeJsonArray(REQUESTS_FILE, requests);
  res.status(201).json({ request: newReq });
});

app.get('/api/my-requests', verifyToken, async (req, res) => {
  const requests = await readJsonArray(REQUESTS_FILE);
  const mine = requests.filter(
    (r) => r.userId === req.user.userId || r.emailHash === req.user.emailHash
  );
  res.json({ requests: mine });
});

app.get('/api/admin/data', verifyToken, requireAdmin, async (req, res) => {
  const [users, requests] = await Promise.all([
    readJsonArray(USERS_FILE),
    readJsonArray(REQUESTS_FILE),
  ]);

  const safeUsers = users.map(
    ({
      passwordHash,
      signupOtpHash,
      signupOtpExpiresAt,
      resetOtpHash,
      resetOtpExpiresAt,
      ...rest
    }) => ({
      ...rest,
      passwordHashed: true,
    })
  );

  res.json({ users: safeUsers, requests });
});

app.patch('/api/admin/requests/:id', verifyToken, requireAdmin, async (req, res) => {
  const progress = Math.max(0, Math.min(100, Number(req.body.progress) || 0));
  const requests = await readJsonArray(REQUESTS_FILE);
  const target = requests.find((r) => r.id === req.params.id);

  if (!target) return res.status(404).json({ error: 'Request not found.' });

  target.progress = progress;
  target.status = progress === 100 ? 'Completed' : 'In Progress';
  await writeJsonArray(REQUESTS_FILE, requests);

  res.json({ request: target });
});

app.listen(PORT, () => {
  console.log(`Secure OTP Agency Server v7 running on http://localhost:${PORT}`);
});
