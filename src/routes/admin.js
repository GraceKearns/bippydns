const router = require('express').Router();
const pool = require('../db')
router.post("/add-domain", async (req,res) => {
    if(!req.body) {
        return res.status(400).json({error:"missing body"})
    }
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ error: "missing required fields: name, type" });
    }
    const result = await pool.query(
        'INSERT INTO domains (name, type) VALUES ($1, $2) RETURNING *',
        [name, type]
    );

    res.json({ message: 'domain added', domain: result.rows[0] });
})
module.exports = router;