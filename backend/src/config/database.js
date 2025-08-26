import sequelize from './sequelize.js';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MS SQL Server Connected');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

export default connectDB;