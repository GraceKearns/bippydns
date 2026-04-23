const router = require('express').Router();
const pool = require('../db');
const path = require("path");
const jwt = require("jsonwebtoken");
const { auth } = require('../middleware/auth');
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
router.get('/dashboard', (req, res) => {
    console.log(req.cookies)
    const token = req.cookies?.token;
    console.log("Accessing dashboard with token:", token);
    if (!token) {
        console.log("No token found in cookies");
        return res.redirect('/signin');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        res.sendFile(path.join(__dirname, "front", "index.html"));
    } catch {
        return res.redirect('/signin');
    }
});
module.exports = router;