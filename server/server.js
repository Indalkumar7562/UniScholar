const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const schemeRoutes = require('./routes/scheme.routes');
const eligibilityRoutes = require('./routes/eligibility.routes');
const aiRoutes = require('./routes/ai.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const documentRoutes = require('./routes/document.routes');
const applicationRoutes = require('./routes/application.routes');

const app = express();

// Ensure uploads folders exist (avatars public, documents private)
const uploadsDir = path.join(__dirname, 'uploads');
const avatarsDir = path.join(__dirname, 'uploads', 'avatars');
const documentsDir = path.join(__dirname, 'uploads', 'documents');
[uploadsDir, avatarsDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


// ─── Audit Logger Middleware ─────────────────────────────────────────
const auditLogger = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    // Log updates, AI verification, and Admin accesses
    if (
      req.method !== 'GET' || 
      req.originalUrl.includes('/api/admin') || 
      req.originalUrl.includes('/api/ai/verify')
    ) {
      const email = req.user ? req.user.email : 'Anonymous';
      const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | User: ${email} | IP: ${req.ip} | Status: ${res.statusCode}\n`;
      try {
        fs.appendFileSync(path.join(__dirname, 'audit.log'), logEntry, 'utf8');
      } catch (err) {
        console.error('Audit logging failed:', err.message);
      }
    }
    originalJson.call(this, body);
  };
  next();
};

// ─── Security Middleware ────────────────────────────────────────────
app.use(helmet());
const allowedClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const localHostPattern = /^http:\/\/localhost(?::\d+)?$/;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === allowedClientUrl || localHostPattern.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Body Parsing & Audit Logging ──────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(auditLogger);

// ─── Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/applications', applicationRoutes);

// Serve profile avatars publicly; private student documents are protected via /api/documents/:id/view
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ─── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'USS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Database Connection & Server Start ───────────────────────────
const PORT = process.env.PORT || 5000;
let server;

const connectWithRetry = async (retries = 0) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');

    if (!server) {
      server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 API docs: http://localhost:${PORT}/api/health`);
      });
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (retries < 5) {
      const delay = (retries + 1) * 5000;
      console.log(`Retrying MongoDB connection in ${delay / 1000}s... (${retries + 1}/5)`);
      setTimeout(() => connectWithRetry(retries + 1), delay);
    } else {
      console.error('Exceeded MongoDB connection retries. Exiting.');
      process.exit(1);
    }
  }
};

connectWithRetry();

module.exports = app;
