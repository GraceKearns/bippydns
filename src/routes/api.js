const router = require('express').Router();
const pool = require('../db');




router.post('/sign-out', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    });

    return res.redirect('/');
});

router.post('/delete-user-record', async (req, res) => {
    const client = await pool.connect();
    try {
        const { userId, recordId } = req.body;
        if (!userId || !recordId) {
            return res.status(400).json({ error: 'missing required fields: userId, recordId' });
        }
        await client.query("BEGIN");
        await client.query(
            `DELETE FROM userdomains WHERE user_id = $1 AND record_id = $2`,
            [userId, recordId]
        );
        await client.query(
            `DELETE FROM records WHERE id = $1`,
            [recordId]
        );
        await client.query("COMMIT");
        res.status(200).json({ message: "successfully deleted record" });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: 'Failed to delete record' });
    } finally {
        client.release();
    }
});



router.post('/add-user-record', async (req, res) => {
    const client = await pool.connect();
    try {
        const ip = req.ip;
        const userId = req.user_id;
        let { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'missing required fields: name' });
        }
        name = name + '.bippydns.com';
        await client.query("BEGIN");
        const getRecordCount = await client.query(
            `SELECT COUNT(*) FROM userdomains WHERE user_id = $1`,
            [userId]
        )
        if (getRecordCount.rows[0].count >= 5) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: 'Domain limit reached (5)' });
        }
        const recordRes = await client.query(
            `INSERT INTO records (domain_id, name, type, content, ttl, disabled, auth)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [2, name, 'A', ip, 60, false, true]
        );
        const recordId = recordRes.rows[0].id;
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

router.get('/view-user-records', (req, res) => {
    const userId = req.user_id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    pool.query(`select us.name,ud.user_id as user_id ,ud.record_id as record_id ,us.content as ipv4
                from userdomains ud 
                join records us on ud.record_id = us.id 
                where ud.user_id = $1`,
        [userId])
        .then(result => {
            res.status(200).json({ records: result.rows });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch records' });
        });
});
module.exports = router;