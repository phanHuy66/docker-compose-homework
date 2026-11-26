const Router = require('restify-router').Router;
const User = require('../models/user');
const { sign } = require('./authenticate');
const router = new Router();


router.post('/login', async (req, res) => {
    const { username = "", password = "" } = req.body || {};

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        username.trim().length === 0 ||
        password.length === 0
    ) {
        res.send(401, {
            success: false,
            code: 401,
            message: "Invalid username or password"
        });
        return;
    }

    try {
        // Kiểm tra tài khoản từ PostgreSQL
        const { success, data } = await User.login(username, password);

        if (!success) {
            res.send(401, {
                success: false,
                code: 401,
                message: "Invalid username or password"
            });
            return;
        }

        // Tạo JWT từ role lưu trong Database
        const token = sign(username, data.role);

        res.send({
            success: true,
            code: 200,
            message: "Login successfully",
            token: token
        });

    } catch (error) {
        console.error("Error logging in:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to login"
        });
    }
});


module.exports = router;