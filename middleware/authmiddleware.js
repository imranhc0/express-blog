const jwt = require("jsonwebtoken")
const dotenv = require("dotenv");

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;


function authMiddleware(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ msg: "Please send Bearer Token" });
        }

        const token = header.split(" ")[1];
        const verify = jwt.verify(token, jwtSecret);

        if (!verify) {
            return res.status(401).json({ msg: "Token is not valid" });
        }

        req.user = verify;
        next();
    } catch (error) {
        console.error("Error during token verification:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
}

module.exports = authMiddleware;