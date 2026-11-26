
const jwt = require('jsonwebtoken');

function authenticated(req, res, next) {
    const authHeader = String(req.headers['authorization'] || '');

    if (!authHeader.startsWith('Bearer ')) {
        res.send(401, {
            success: false,
            code: 401,
            message: "Unauthorized access - No token"
        });
        return next(false);
    }

    const token = authHeader.substring(7);

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        res.send(401, {
            success: false,
            code: 401,
            message: "Unauthorized access - Invalid token"
        });
        return next(false);
    }

    req.user = {
        username: decoded.username,
        role: decoded.role
    };

    return next();
}

function sign(username, role) {
    return jwt.sign(
        { username, role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

module.exports = { authenticated, sign };
