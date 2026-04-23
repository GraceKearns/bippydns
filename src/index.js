require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { requireApiKey, requireAdminApiKey } = require('./middleware/auth');
const session = require("express-session");
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const protectedRoutes = require('./routes/api');
const pagesRoutes = require('./routes/pages');
const { auth } = require('./middleware/auth');
const SECRET_KEY = process.env.SECRET_KEY
const { createTablesIfNotExist } = require('./db');
const cookieParser = require("cookie-parser");
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'https://bippydns.com,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const authLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_AUTH_MAX || 10),
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_API_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'routes/front')))
app.use(express.json());
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));
app.use(['/post-sign-in', '/post-sign-up', '/activate-account'], authLimiter);


app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));
app.use('/admin', requireAdminApiKey, adminRoutes);
app.use('/api', auth, protectedRoutes);
app.use('/public', publicRoutes);
app.use('/', pagesRoutes);
app.use
createTablesIfNotExist()
    .then(() => {
        app.listen(3000, () => {
            console.log("hello");
        });
    })
    .catch((err) => {
        console.error("Failed to create tables:", err);
        process.exit(1);
    });
