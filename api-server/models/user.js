
const { getPgClient } = require('./db.js');
const format = require('pg-format');

const login = async (username, password) => {
    const client = getPgClient();

    try {
        const sql = format(
            "SELECT json_agg(public.login(%L, %L)) AS result",
            username, password
        );

        await client.connect();
        const result = await client.query(sql);

        return result.rows[0].result[0];
    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }
};

module.exports = {
    login
};
