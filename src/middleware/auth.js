const jwt = require("jsonwebtoken");


const API_KEY = process.env.API_KEY;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;


function requireApiKey(req, res, next) {

    const key = req.headers['x-api-key'];
    if (!key || key !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

function requireAdminApiKey(req, res, next) {
    const key = req.headers['x-api-key'];
    if (!key || key !== ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// function requireSessionUser(req, res, next) {
//     if (req.session?.userId) {
//         return next();
//     }
//     const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
//     if (acceptsHtml) {
//         const nextPath = encodeURIComponent(req.originalUrl || '/dashboard');
//         return res.redirect(`/signin?next=${nextPath}`);
//     }
//     return res.status(401).json({ error: 'Unauthorized' });
// }


function auth(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user_id = decoded.userId; 
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
module.exports = { requireApiKey, requireAdminApiKey, auth };
