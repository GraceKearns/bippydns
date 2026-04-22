const router = require('express').Router();
const pool = require('../db');


// Private routes — API key required (enforced in index.js)
router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

router.post('/add-record', async (req, res) => {
    const ip = req.ip
    let { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'missing required fields: name' });
    }
    name = "." + name + "bippydns.com"
    const result = await pool.query(
        `INSERT INTO records (domain_id, name, type, content, ttl, disabled, auth)
         VALUES ( $1,  $2, $3, $4, $5, $6, $7) RETURNING *`,
        [2, name, 'A', ip, 60, false, true]
    );
    res.json({ message: 'record added', record: result.rows[0] });
});

router.post('/remove-record', async (req, res) => {
    let { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'missing required fields: id' });
    }
    const result = await pool.query(
        `DELETE FROM records WHERE id = $1 RETURNING *`,
        [id]
    );
    res.json({ message: 'record removed', record: result.rows[0] });
});









module.exports = router;
