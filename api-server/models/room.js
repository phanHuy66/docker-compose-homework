
const { getPgClient } = require('./db.js');
const format = require('pg-format');

const all = async () => {
    const client = getPgClient();
    const sql = "SELECT * FROM room";
    let result = [];

    try {
        await client.connect();
        const queryResult = await client.query(sql);
        result = queryResult.rows;
    } catch (error) {
        console.error("Error getting rooms:", error);
    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }

    return result;
};


const byId = async (id) => {
    const client = getPgClient();

    try {
        const sql = format(
            "SELECT * FROM room WHERE room_id = %L",
            id
        );

        await client.connect();
        const result = await client.query(sql);

        return {
            found: result.rows.length > 0,
            data: result.rows[0]
        };
    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }
};


const add = async (name, price) => {
    const client = getPgClient();

    try {
        const sql = format(
            "INSERT INTO room (name, price) VALUES (%L, %L)",
            name, price
        );

        await client.connect();
        await client.query(sql);
    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }
};


const remove = async (id) => {
    const client = getPgClient();

    try {
        const sql = format(
            "DELETE FROM room WHERE room_id = %L",
            id
        );

        await client.connect();
        const result = await client.query(sql);

        return result.rowCount > 0;
    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }
};

const update = async (id, name, price) => {
    const client = getPgClient();

    try {
        const sql = format(
            "UPDATE room SET name = %L, price = %L WHERE room_id = %L",
            name, price, id
        );

        await client.connect();
        const result = await client.query(sql);

        return result.rowCount > 0;
    } finally {
        try {
            await client.end();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }
};

module.exports = {
    all,
    byId,
    add,
    remove,
    update
};
