var restify = require('restify');

var corsMiddleware = require('restify-cors-middleware2');

const { Client } = require('pg');


var server = restify.createServer();


var cors = corsMiddleware({
    preflightMaxAge: 5,
    origins: ['*'],
    allowHeaders: ['X-App-Version'],
    exposeHeaders: []
});

server.pre(cors.preflight);
server.use(cors.actual);



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
