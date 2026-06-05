const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://acadfee_user:My2hhs4Hfi8srlAj5mMGxJyZpglaPmUL@dpg-d6pbmqhr0fns73e91pbg-a.oregon-postgres.render.com/acadfee';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
