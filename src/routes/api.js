const router = require('express').Router();
const pool = require('../db');
const net = require("net");



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
        const rawIp = req.ip;
        const userId = req.user_id;
        let { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'missing required fields: name' });
        }

        name = name + '.bippydns.com';
        let ip = rawIp;

        if (ip.startsWith("::ffff:")) {
            ip = ip.replace("::ffff:", "");
        }

        const ipVersion = net.isIP(ip); 

        if (!ipVersion) {
            return res.status(400).json({ error: 'Invalid IP address' });
        }

        const recordType = ipVersion === 6 ? 'AAAA' : 'A';

        await client.query("BEGIN");

        const getRecordCount = await client.query(
            `SELECT COUNT(*) FROM userdomains WHERE user_id = $1`,
            [userId]
        );

        if (parseInt(getRecordCount.rows[0].count) >= 5) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: 'Domain limit reached (5)' });
        }

        const recordRes = await client.query(
            `INSERT INTO records (domain_id, name, type, content, ttl, disabled, auth)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [2, name, recordType, ip, 60, false, true]
        );
        const recordId = recordRes.rows[0].id;
        await client.query(
            `INSERT INTO userdomains (user_id, record_id)
             VALUES ($1, $2)`,
            [userId, recordId]
        );
        await client.query("COMMIT");
        res.status(200).json({
            message: "successfully added row",
            type: recordType,
            ip
        });

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



router.put('/edit-user-record', async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user_id;
        console.log(userId)
        let { record_id, ipv4, ipv6 } = req.body;
        console.log(record_id, ipv4, ipv6)
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await client.query("BEGIN");

    
        const recordRes = await client.query(
            `SELECT r.id, r.name, r.domain_id
             FROM records r
             JOIN userdomains ud ON ud.record_id = r.id
             WHERE ud.user_id = $1 AND r.id = $2`,
            [userId, record_id]
        );

        if (recordRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: 'Record not found' });
        }

        const { name, domain_id } = recordRes.rows[0];

        if (ipv4 && ipv4.startsWith("::ffff:")) {
            ipv4 = ipv4.replace("::ffff:", "");
        }

        if (ipv4 && net.isIP(ipv4) === 4) {
            const existingA = await client.query(
                `SELECT id FROM records
                 WHERE name = $1 AND type = 'A' AND domain_id = $2`,
                [name, domain_id]
            );

            if (existingA.rowCount > 0) {
                await client.query(
                    `UPDATE records SET content = $1 WHERE id = $2`,
                    [ipv4, existingA.rows[0].id]
                );
            } else {
                await client.query(
                    `INSERT INTO records (domain_id, name, type, content, ttl, disabled, auth)
                     VALUES ($1, $2, 'A', $3, 60, false, true)`,
                    [domain_id, name, ipv4]
                );
            }
        }
        if (ipv6 && net.isIP(ipv6) === 6) {
            const existingAAAA = await client.query(
                `SELECT id FROM records
                 WHERE name = $1 AND type = 'AAAA' AND domain_id = $2`,
                [name, domain_id]
            );

            if (existingAAAA.rowCount > 0) {
                await client.query(
                    `UPDATE records SET content = $1 WHERE id = $2`,
                    [ipv6, existingAAAA.rows[0].id]
                );
            } else {
                await client.query(
                    `INSERT INTO records (domain_id, name, type, content, ttl, disabled, auth)
                     VALUES ($1, $2, 'AAAA', $3, 60, false, true)`,
                    [domain_id, name, ipv6]
                );
            }
        }
        await client.query("COMMIT");
        res.status(200).json({
            message: "Record(s) updated successfully"
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: 'Failed to update record' });
    } finally {
        client.release();
    }
});
module.exports = router;