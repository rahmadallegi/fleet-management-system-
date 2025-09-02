import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

const config = {
  connectionString: process.env.SQL_SERVER_CONNECTION_STRING,
  options: {
    trustServerCertificate: true // Accept self-signed certs for local dev
  }
};

const connectToSqlServer = async () => {
  try {
    await sql.connect(config);
    console.log('✅ Connected to SQL Server');
  } catch (error) {
    console.error('❌ SQL Server connection error:', error);
    throw error;
  }
};

export { sql, connectToSqlServer };
