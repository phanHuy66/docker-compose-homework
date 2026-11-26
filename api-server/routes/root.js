
const Router = require('restify-router').Router;
const router = new Router();
const { getPgClient } = require('../models/db');

router.get('/', async (req, res) => {
    const client = getPgClient();

    let db_info = "Database is up & running";

    try {
        await client.connect();
    } catch (error) {
        db_info = "Cannot connect to database!";
        console.error(error);
    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }

    res.send({
        Server: "Server is working",
        Database: db_info
    });
});

module.exports = router;
