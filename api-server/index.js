var restify = require('restify');

var corsMiddleware = require('restify-cors-middleware2');

const { Client } = require('pg');

var jwt = require('jsonwebtoken');


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

server.get('/', async function(req, res) {
    const client = new Client({
        host: `${process.env.POSTGRES_HOST}`,
        port: `${process.env.POSTGRES_PORT}`,
        database: `${process.env.POSTGRES_DB}`,
        user: `${process.env.POSTGRES_USER}`,
        password: `${process.env.POSTGRES_PASSWORD}`,
    });

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
    const client = new Client({
        host: `${process.env.POSTGRES_HOST}`,
        port: `${process.env.POSTGRES_PORT}`,
        database: `${process.env.POSTGRES_DB}`,
        user: `${process.env.POSTGRES_USER}`,
        password: `${process.env.POSTGRES_PASSWORD}`,
    });

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


server.listen(PORT, function() {
    console.log('%s listening at %s', server.name, server.url);
});
