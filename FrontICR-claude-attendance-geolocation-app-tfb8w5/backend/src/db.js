const { Pool } = require('pg');

// Un único Pool para todo el proceso; pg maneja el pooling de conexiones internamente.
// DATABASE_URL es la única pieza que cambia entre proveedores (Supabase/Neon/Render/local).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
