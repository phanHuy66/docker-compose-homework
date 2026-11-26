var restify = require('restify');


const root = require('./routes/root');

const login = require('./routes/login');

const room = require('./routes/room');



var corsMiddleware = require('restify-cors-middleware2');







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









var PORT = 8080;

// Endpoint chuẩn bị cho chức năng đăng nhập














root.applyRoutes(server);
login.applyRoutes(server);
room.applyRoutes(server);


server.listen(PORT, function() {
    console.log('%s listening at %s', server.name, server.url);
});
