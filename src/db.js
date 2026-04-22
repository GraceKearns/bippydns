
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createTablesIfNotExist() {
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_verified BOOLEAN DEFAULT false,
            verify_token TEXT,
            verify_token_expires TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS UserDomains (
            user_domain_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(id),
            record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    
}

module.exports = pool;
module.exports.createTablesIfNotExist = createTablesIfNotExist;
