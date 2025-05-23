const { Pool } = require('pg');

const pool = new Pool({
    user: 'myuser',
    host: process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost',
    database: 'mydatabase',
    password: 'mypassword',
    port: 5432
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};