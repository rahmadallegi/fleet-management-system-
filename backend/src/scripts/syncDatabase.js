import sequelize from '../config/sequelize.js';
import '../models/index.js';

const syncDatabase = async () => {
  try {
    console.log('🔄 Synchronizing database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
};

syncDatabase();

