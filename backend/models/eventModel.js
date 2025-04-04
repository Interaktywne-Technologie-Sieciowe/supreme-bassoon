const pool = require('../config/database');

exports.findAll = async () => {
    const result = await pool.query(`
        SELECT e.*, c.name as conference_name
        FROM events e
        JOIN conference c ON e.conference_id = c.id
        ORDER BY e.start_date
    `);
    return result.rows;
};

exports.findById = async (id) => {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0];
};

exports.create = async (data) => {
    const {
        name, start_date, end_date, conference_id, location
    } = data;

    const result = await pool.query(`
        INSERT INTO events (name, start_date, end_date, conference_id, location, last_update)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
    `, [name, start_date, end_date, conference_id, location]);

    return result.rows[0];
};

exports.update = async (id, data) => {
    // Start building the query
    let query = ['UPDATE events SET'];
    const values = [];
    let valueIndex = 1;

    // For each property in data, add it to the query if it exists
    const updates = [];

    if (data.name !== undefined) {
        updates.push(`name = $${valueIndex++}`);
        values.push(data.name);
    }

    if (data.start_date !== undefined) {
        updates.push(`start_date = $${valueIndex++}`);
        values.push(data.start_date);
    }

    if (data.end_date !== undefined) {
        updates.push(`end_date = $${valueIndex++}`);
        values.push(data.end_date);
    }

    if (data.conference_id !== undefined) {
        updates.push(`conference_id = $${valueIndex++}`);
        values.push(data.conference_id);
    }

    if (data.location !== undefined) {
        updates.push(`location = $${valueIndex++}`);
        values.push(data.location);
    }

    // Always update the last_update timestamp
    updates.push(`last_update = NOW()`);

    // If no fields to update, just return the existing record
    if (updates.length === 1) {  // Only last_update is in the array
        const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        return result.rows[0];
    }

    // Complete the query
    query.push(updates.join(', '));
    query.push(`WHERE id = $${valueIndex} RETURNING *`);
    values.push(id);

    const result = await pool.query(query.join(' '), values);
    return result.rows[0];
};
exports.remove = async (id) => {
    const result = await pool.query('DELETE FROM events WHERE id = $1', [id]);
    return result.rowCount > 0;
};
