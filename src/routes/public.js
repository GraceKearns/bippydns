const router = require('express').Router();
const path = require("path");
const pool = require('../db');
const { takeScreenshot } = require("../screenshot");
const fs = require("fs");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const transporter = require('../mailer');
const jwt = require("jsonwebtoken");
const { auth } = require('../middleware/auth');
const APP_BASE_URL = process.env.NODE_ENV === "production" ? process.env.APP_BASE_URL_PROD : process.env.APP_BASE_URL_DEV;
const { getEmailTemplate } = require('../util/getEmailTemplate');
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "front", "index.html"));
});


router.get('/get-collections', async (req, res) => {
    const result = await pool.query("select name from records");
    res.status(200).json(result.rows);
});

router.get("/screenshot/:name", async (req, res) => {
    const { name } = req.params;
    const files = fs.readdirSync('./src/screenshots');
    const pattern = new RegExp(`^${name}-(\\d{4})-(\\d{2})-(\\d{2})`);
    const matchFile = files.find(file => pattern.test(file));
    if (matchFile) {
        console.log(`Found existing screenshot: ${matchFile}`);
        const [, year, month, day] = pattern.exec(matchFile);
        const fileDate = new Date(`${year}-${month}-${day}`);
        const now = new Date();
        const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
        if (diffDays < 1) {
            return res.status(200).json({
                image: `/screenshots/${matchFile}`
            });
        }
        else {
            fs.unlinkSync(path.join('./src/screenshots', matchFile));
            console.log(`Deleted old screenshot: ${matchFile}`);
        }
    }
    const pathOutput = await takeScreenshot(name);
    return res.status(200).json({
        image: pathOutput
    });
});

router.get('/session', auth, (req, res) => {
    console.log(req)
    console.log(req.cookies)
    res.status(200).json({ authenticated: Boolean(req.user_id) });
});

router.post('/post-sign-up', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 60);
        const verifyUniqueEmail = await pool.query(
            `SELECT email FROM users WHERE email = $1`, [email]
        );
        if (verifyUniqueEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use.' });
        }
        const result = await pool.query(
            `INSERT INTO users (email, password, verify_token, verify_token_expires)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [email, hashedPassword, token, expires]
        );
        const verifyUrl = `${APP_BASE_URL}/verify?token=${encodeURIComponent(token)}&next=%2Fdashboard`;

        const html = await getEmailTemplate("activate.html", {
            VERIFY_URL: verifyUrl
        });
        await transporter.sendMail({
            to: email,
            subject: "Activate your BippyDNS account",
            html: html
        });
        res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
});


router.post('/post-sign-in', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    const user = result.rows[0];
    if (!user) {
        return res.status(401).send({ "message": "Invalid login" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).send({ "message": "Invalid login" });
    }
    if (!user.is_verified) {
        return res.status(403).send({ "message": "Please verify email" });
    }
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ token });
});

router.post('/activate-account', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Missing activation token.' });
    }
    const userResult = await pool.query(
        `SELECT id, is_verified, verify_token_expires
         FROM users
         WHERE verify_token = $1`,
        [token]
    );
    const user = userResult.rows[0];
    if (!user) {
        return res.status(400).json({ error: 'Invalid activation token.' });
    }
    if (user.is_verified) {
        return res.status(200).json({
            message: 'Account already activated.',
            authenticated: Boolean(req.session?.userId)
        });
    }

    if (!user.verify_token_expires || new Date(user.verify_token_expires) < new Date()) {
        return res.status(400).json({ error: 'Activation token has expired.' });
    }

    await pool.query(
        `UPDATE users
         SET is_verified = true,
             verify_token = NULL,
             verify_token_expires = NULL
         WHERE id = $1`,
        [user.id]
    );

    return res.status(200).json({
        message: 'Account activated.',
        authenticated: Boolean(req.session?.userId)
    });
});

router.post('/resend-activation', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    const userResult = await pool.query(
        `SELECT id, is_verified, verify_token_expires
         FROM users
         WHERE email = $1`,
        [email]
    );
    const user = userResult.rows[0];
    if (!user) {
        return res.status(400).json({ error: 'Invalid email.' });
    }
    if (user.is_verified) {
        return res.status(200).json({
            message: 'Account already activated.',
            authenticated: Boolean(req.session?.userId)
        });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await pool.query(
        `UPDATE users
             SET verify_token = $1, verify_token_expires = $2
             WHERE id = $3`,
        [token, expires, user.id]
    );
    const verifyUrl = `${APP_BASE_URL}/verify?token=${encodeURIComponent(token)}&next=%2Fdashboard`;
    const html = await getEmailTemplate("activate.html", {
        VERIFY_URL: verifyUrl
    });
    await transporter.sendMail({
        to: email,
        subject: "Activate your BippyDNS account",
        html: html
    });
    res.status(200).json({ message: 'Activation email resent.' });
});
module.exports = router;







