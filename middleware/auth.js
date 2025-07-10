const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (! token) {
        return res.status(401).json({ message: "Access token required" });
    }
   try {
     jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) {
           return res.status(403).json({ message: "Token expired" });
        }
        req.user = user;
        next();
    })
   } catch(error) {
    res.status(500).json({ error: error.message });
   }
}

module.exports = { authenticateToken };