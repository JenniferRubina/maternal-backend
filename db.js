
const { Pool } = require('pg');

// Connect using Render's DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render provides this as an env variable
  ssl: {
    rejectUnauthorized: false, // Required for Render’s managed PostgreSQL
  },
});

module.exports = pool;
