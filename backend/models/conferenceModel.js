const pool = require('../config/database');

async function findAllConferences() {
    const { rows } = await pool.query('SELECT * FROM CONFERENCE ORDER BY start_date DESC');
    return rows;
}

async function findConferenceById(conferenceId) {
    const { rows } = await pool.query('SELECT * FROM CONFERENCE WHERE id = $1', [conferenceId]);
    return rows[0];
}

async function getEventsForConference(conferenceId) {
    const { rows } = await pool.query('SELECT * FROM EVENTS WHERE conference_id = $1', [conferenceId]);
    return rows;
}

async function getBookmarksByEventIds(eventIds) {
    if (eventIds.length === 0) return [];
    const { rows } = await pool.query(
        `SELECT * FROM BOOKMARKS WHERE event_id = ANY($1::uuid[])`,
        [eventIds]
    );
    return rows;
}

async function getUsersForConference(conferenceId) {
    const { rows } = await pool.query(
        'SELECT * FROM USERS_CONFERENCE WHERE conference_id = $1',
        [conferenceId]
    );
    return rows;
}

async function insertRow(client, table, row) {
    const keys = Object.keys(row);
    const values = Object.values(row);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    await client.query(query, values);
}

async function importFullConference(client, data) {
    await insertRow(client, 'CONFERENCE', data.conference);
    for (const e of data.events) {
        await insertRow(client, 'EVENTS', e);
    }
    for (const b of data.bookmarks) {
        await insertRow(client, 'BOOKMARKS', b);
    }
    for (const uc of data.users_conference) {
        await insertRow(client, 'USERS_CONFERENCE', uc);
    }
}

module.exports = {
    findConferenceById,
    getEventsForConference,
    getBookmarksByEventIds,
    getUsersForConference,
    importFullConference,
    findAllConferences
};
