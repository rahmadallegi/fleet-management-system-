require('dotenv').config();
const sql = require('mssql');

const config = {
  connectionString: process.env.SQL_SERVER_CONNECTION_STRING,
  options: {
    trustServerCertificate: true // Important for local development
  }
};

const connectToSqlServer = async () => {
  try {
    await sql.connect(config);
    console.log('✅ Connected to SQL Server');
  } catch (err) {
    console.error('❌ SQL Server connection error:', err);
  }
};

module.exports = { sql, connectToSqlServer };
