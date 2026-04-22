const router = require('express').Router();
const path = require("path");
const pool = require('../db');
const { takeScreenshot } = require("../screenshot");
const fs = require("fs");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const transporter = require('../mailer');
const { requireSessionUser } = require('../middleware/auth');

const APP_BASE_URL = process.env.APP_BASE_URL || 'https://bippydns.com';
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "front", "index.html"));
});

router.get('/collections', (req, res) => {
    res.sendFile(path.join(__dirname, "front", "index.html"));
});
router.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, "front", "index.html"));
});
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, "front", "index.html"));
});
router.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, "front", "index.html"));
});
router.get('/dashboard', requireSessionUser, (req, res) => {
    res.sendFile(path.join(__dirname, "front", "index.html"));
});
router.get('/auth/session', (req, res) => {
    res.status(200).json({ authenticated: Boolean(req.session?.userId) });
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
        const [, year, month, day] = pattern.exec(matchFile);
        const fileDate = new Date(`${year}-${month}-${day}`);
        const now = new Date();
        const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
        if (diffDays < 1) {
            return res.status(200).json({
                image: `/screenshots/${matchFile}`
            });
        }
    }
    const pathOutput = await takeScreenshot(name);
    return res.status(200).json({
        image: pathOutput
    });
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
        await transporter.sendMail({
            to: email,
            subject: "Activate your BippyDNS account",
            html: `
                <div style="font-family: Arial, sans-serif; background:#fff6fb; padding:24px; color:#300e21;">
                    <div style="max-width:560px; margin:0 auto; background:#f7e2ed; border:2px solid #e255a3; border-radius:16px; padding:24px;">
                        <h2 style="margin:0 0 12px; color:#e255a3;">Welcome to BippyDNS</h2>
                        <p style="margin:0 0 16px; line-height:1.5;">Activate your account to unlock your dashboard.</p>
                        <a href="${verifyUrl}" style="display:inline-block; background:#e255a3; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:999px; font-weight:bold;">
                            Activate account & open dashboard
                        </a>
                        <p style="margin:16px 0 0; font-size:12px; color:#5b2d47;">This link expires in 1 hour.</p>
                    </div>
                </div>
            `
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
    req.session.userId = user.id;

    res.status(200).json({ message: "Logged in" });
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
module.exports = router;

router.post('/sign-out', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Could not sign out' });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Signed out' });
        });
    } else {
        res.status(200).json({ message: 'Signed out' });
    }
});

router.post('/add-user-record', requireSessionUser, async (req, res) => {
    const client = await pool.connect();

    try {
        const ip = req.ip;
        const userId = req.session?.userId;
        let { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'missing required fields: name' });
        }

        name = name + '.bippydns.com';

        await client.query("BEGIN");

        // 1. Insert record
        const recordRes = await client.query(
            `INSERT INTO records (domain_id, name, type, content, ttl, disabled, auth)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [2, name, 'A', ip, 60, false, true]
        );

        const recordId = recordRes.rows[0].id;

        // 2. Link to user
        await client.query(
            `INSERT INTO userdomains (user_id, record_id)
             VALUES ($1, $2)`,
            [userId, recordId]
        );

        await client.query("COMMIT");

        res.status(200).json({ message: "successfully added row" });

    } catch (err) {
        await client.query("ROLLBACK"); 
        console.error(err);
        res.status(500).json({ error: 'Failed to add record' });

    } finally {
        client.release();
    }
});


router.get('/view-user-records', requireSessionUser, (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    pool.query(`select us.name from userdomains ud join records us on ud.record_id = us.id where ud.user_id = $1`, [userId])
        .then(result => {
            res.status(200).json({ records: result.rows });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch records' });
        });
});
