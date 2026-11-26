const Router = require('restify-router').Router;
const jwt = require('jsonwebtoken');
const router = new Router();

router.post('/login', async (req, res) => {
    const { username = "", password = "" } = req.params;

    // Kiểm tra thiếu username hoặc password
    if (username.length === 0 || password.length === 0) {
        return res.send(401, {
            success: false,
            code: 401,
            message: "Invalid username or password"
        });
    }

    // Kiểm tra tài khoản hợp lệ
    if (
        (username === "admin" && password === "1234") ||
        (username === "manager01" && password === "1234") ||
        (username === "manager02" && password === "1234") ||
        (username === "customer01" && password === "1234")
    ) {
        // Khóa ký JWT (chỉ dùng tạm cho bài thực hành)
        const secret = process.env.JWT_SECRET;

        const token = jwt.sign({
            username: username,
            role: username === "admin" ? "admin"
                : (username === "manager01" ||
                   username === "manager02") ? "manager"
                : "customer"
        }, secret, { expiresIn: "1h" });

        return res.send({
            success: true,
            code: 200,
            message: "Login successfully",
            token: token
        });

    } else {
        return res.send(401, {
            success: false,
            code: 401,
            message: "Invalid username or password"
        });
    }
});

module.exports = router;