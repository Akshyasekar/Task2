const jwt = require("jsonwebtoken");

function auth(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Please login"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        });

    }
}

module.exports = auth;
