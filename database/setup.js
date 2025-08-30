
// Fleet Management System - MS SQL Database Setup Script
// This script sets up the MS SQL database connection and verifies connectivity

const sql = require('mssql');

// Database configuration (update with your SQL Server credentials)
const DB_CONFIG = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'fleet_management',
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true
  }
};

async function setupDatabase() {
  let pool;
  try {
    console.log('🔌 Connecting to MS SQL Server...');
    pool = await sql.connect(DB_CONFIG);
    console.log(`✅ Connected to database: ${DB_CONFIG.database}`);

    // Optionally, run schema and sample data scripts
    // You can use sql.query(fs.readFileSync('sql/schema.sql', 'utf8'))
    // and sql.query(fs.readFileSync('sql/sample_data.sql', 'utf8'))
    // to initialize the database if needed

    // Example: Count users
    const result = await pool.request().query('SELECT COUNT(*) as userCount FROM users');
    console.log(`👥 Users: ${result.recordset[0].userCount}`);

    // Add more summary queries as needed

    console.log('🎯 Database connection and summary completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
