
// Fleet Management System - MS SQL Database Setup Script
// This script connects to the SQL Server and verifies connectivity.

import sql from 'mssql'; // use import (ESM) instead of require
import dotenv from 'dotenv';

dotenv.config();

// Database configuration (from .env)
const DB_CONFIG = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'fleet_management',
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true, // Allow self-signed certs (local dev)
  },
};

export const setupDatabase = async () => {
  let pool;
  try {
    console.log('🔌 Connecting to MS SQL Server...');
    pool = await sql.connect(DB_CONFIG);
    console.log(`✅ Connected to database: ${DB_CONFIG.database}`);

    // Example: Check users table count
    const result = await pool.request().query('SELECT COUNT(*) as userCount FROM Users');
    console.log(`👥 Users in DB: ${result.recordset[0].userCount}`);

    console.log('🎯 Database setup & connectivity test completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run script directly from terminal
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}
