var restify = require('restify');

var corsMiddleware = require('restify-cors-middleware2');

const { Client } = require('pg');

var jwt = require('jsonwebtoken');

var format = require('pg-format');

var server = restify.createServer();


var cors = corsMiddleware({
    preflightMaxAge: 5,
    origins: ['*'],
    allowHeaders: ['X-App-Version'],
    exposeHeaders: []
});

server.pre(cors.preflight);
server.use(cors.actual);

// Parse dữ liệu được gửi từ request body
server.use(restify.plugins.bodyParser({ mapParams: true }));

// Parse các tham số trên URL (query string)
server.use(restify.plugins.queryParser());

// Tạo PostgreSQL Client
function getPgClient() {
    return new Client({
        host: `${process.env.POSTGRES_HOST}`,
        port: `${process.env.POSTGRES_PORT}`,
        database: `${process.env.POSTGRES_DB}`,
        user: `${process.env.POSTGRES_USER}`,
        password: `${process.env.POSTGRES_PASSWORD}`,
    });
}


function authenticated(req, res, next) {
    // 1. Lấy Authorization header
    const authHeader = String(req.headers['authorization'] || '');

    // 2. Kiểm tra có Bearer token không
    if (!authHeader.startsWith('Bearer ')) {
        res.send(401, {
            success: false,
            code: 401,
            message: "Unauthorized access - No token"
        });
        return next(false);
    }

    // 3. Trích xuất token
    const token = authHeader.substring(7);

    let decoded;

    // 4. Xác minh JWT
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

    // 5. Lưu thông tin người dùng vào request
    req.user = {
        username: decoded.username,
        role: decoded.role
    };

    // 6. Cho phép request đi tiếp
    return next();
}


server.get('/', async function(req, res) {
    const client = getPgClient();

    var db_info = "Database is up & running";

    try {
        await client.connect();
    } catch (e) {
        db_info = "Cannot connect to database!";
        console.log(e);
    } finally {
        await client.end();
    }

    res.send({
        Server: "Server is working",
        Database: db_info
    });
});


var PORT = 8080;

// Endpoint chuẩn bị cho chức năng đăng nhập

server.post('/login', async (req, res) => {
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



server.get('/room', async function(req, res) {
    const client = getPgClient();

    var sql = "select * from room";
    var result = [];

    try {
        await client.connect();
        result = await client.query(sql);
        result = result.rows;
    } catch (e) {
        console.log(e);
    } finally {
        await client.end();
    }

    res.send({
        rooms: result
    });
});



server.post('/room', authenticated, async (req, res) => {
    

    // 3. Kiểm tra quyền admin hoặc manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
        res.send(403, {
            success: false,
            code: 403,
            message: "Forbidden: insufficient permission"
        });
        return;
    }

    // 4. Nhận và kiểm tra thông tin phòng
    const { name = "", price = 0 } = req.params;

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room name or price"
        });
        return;
    }

    // 5. Thêm phòng vào PostgreSQL
    const client = getPgClient();

    try {
        const sql = format(
            "INSERT INTO room (name, price) VALUES (%L, %L)",
            name, price
        );

        await client.connect();
        await client.query(sql);

    } catch (error) {
        console.error("Error inserting room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to add room"
        });
        return;

    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }

    // 6. Trả response sau khi INSERT hoàn tất
    res.send({
        success: true,
        code: 200,
        message: "Room added successfully"
    });
});


server.get('/room/:id', async (req, res) => {
    const id = req.params.id;
    const client = getPgClient();

    try {
        const sql = format(
            "SELECT * FROM room WHERE room_id = %L",
            id
        );

        await client.connect();
        const result = await client.query(sql);

        const found = result.rows.length > 0;

        if (found) {
            res.send({
                success: true,
                code: 200,
                message: "",
                data: result.rows[0]
            });
        } else {
            res.send(404, {
                success: false,
                code: 404,
                message: "Cannot find room with id: " + id
            });
        }

    } catch (error) {
        console.error("Error getting room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to get room"
        });

    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }
});


server.del('/room/:id', authenticated, async (req, res) => {

    // 3. Kiểm tra quyền
    if (req.user.role !== "admin" && req.user.role !== "manager") {
        res.send(403, {
            success: false,
            code: 403,
            message: "Forbidden: insufficient permission"
        });
        return;
    }

    // 4. Lấy và kiểm tra ID phòng
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room ID"
        });
        return;
    }

    // 5. Xóa phòng trong PostgreSQL
    const client = getPgClient();
    let result;

    try {
        const sql = format(
            "DELETE FROM room WHERE room_id = %L",
            id
        );

        await client.connect();
        result = await client.query(sql);

    } catch (error) {
        console.error("Error deleting room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to delete room"
        });
        return;

    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }

    // 6. Kiểm tra phòng có được xóa hay không
    const found = result.rowCount > 0;

    if (found) {
        res.send({
            success: true,
            code: 200,
            message: "Room deleted successfully"
        });
    } else {
        res.send(404, {
            success: false,
            code: 404,
            message: "Cannot delete room with id: " + id
        });
    }
});


server.patch('/room/:id', authenticated, async (req, res) => {
    // 1. Lấy JWT từ Header
    

    // 3. Kiểm tra quyền
    if (req.user.role !== "admin" && req.user.role !== "manager") {
        res.send(403, {
            success: false,
            code: 403,
            message: "Forbidden: insufficient permission"
        });
        return;
    }

    // 4. Nhận và kiểm tra dữ liệu
    const id = Number(req.params.id);
    const { name = "", price = 0 } = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room ID"
        });
        return;
    }

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room name or price"
        });
        return;
    }

    // 5. Cập nhật thông tin phòng
    const client = getPgClient();
    let result;

    try {
        const sql = format(
            "UPDATE room SET name = %L, price = %L WHERE room_id = %L",
            name, price, id
        );

        await client.connect();
        result = await client.query(sql);

    } catch (error) {
        console.error("Error updating room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to update room"
        });
        return;

    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }

    // 6. Kiểm tra kết quả UPDATE
    if (result.rowCount > 0) {
        res.send({
            success: true,
            code: 200,
            message: "Room updated successfully"
        });
    } else {
        res.send(404, {
            success: false,
            code: 404,
            message: "Cannot update room with id: " + id
        });
    }
});



server.listen(PORT, function() {
    console.log('%s listening at %s', server.name, server.url);
});
