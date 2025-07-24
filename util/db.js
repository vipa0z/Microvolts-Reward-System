const mariadb = require('mariadb');
const chalk = require('chalk');
    const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3305,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5
  });

  module.exports = {
    query: async (sql, params = []) => {
      let conn;
      try {
        conn = await pool.getConnection();
  
        // Optional health check (only during startup or debugging)
        
  
        const res = await conn.query(sql, params);
        return res;
      } catch (err) {
        console.error(chalk.red('❌ Database query failed:', err));
      } finally {
        if (conn) conn.release();
      }
    }
  };