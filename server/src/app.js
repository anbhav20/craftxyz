import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { securityHeaders, sanitizeInput, preventParamPollution, apiLimiter } from './middleware/security.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { ApiResponse } from './utils/ApiResponse.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const app = express();

// Trust the first proxy hop (needed on most hosts — Render/Railway/etc.
// sit behind a proxy, and without this, rate-limit/req.ip and secure
// cookies behave incorrectly).
app.set('trust proxy', 1);

// ── Core middleware ─────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // required so the refresh-token cookie is sent/accepted
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ── Security middleware ─────────────────────────────────
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(preventParamPollution);
app.use('/api', apiLimiter);

// ── Health check (useful for uptime monitors / deploy checks) ──
app.get('/api/health', (req, res) => {
  new ApiResponse(200, { uptime: process.uptime() }, 'API is healthy').send(res);
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 + error handling (must stay last) ──────────────
app.use(notFound);
app.use(errorHandler);
