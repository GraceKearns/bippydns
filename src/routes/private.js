const router = require('express').Router();
const pool = require('../db');


// Private routes — API key required (enforced in index.js)
router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});











module.exports = router;
