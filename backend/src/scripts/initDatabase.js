import sequelize from '../config/sequelize.js';
import { User, Vehicle, Driver, Trip, FuelLog, Maintenance, Alert } from '../models/index.js';
import seedDatabase from './seedDatabase.js'; // Make sure this is converted to SQL/Sequelize
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    console.log('🔌 Connecting to SQL database...');
    await sequelize.authenticate();
    console.log('✅ Connected to SQL database successfully!');

    // Optional: sync models (create tables if they don't exist)
    // WARNING: { force: true } will DROP tables first
    await sequelize.sync({ alter: true });
    console.log('🗄️ Models synced successfully');

    // Check database status
    const counts = {
      users: await User.count(),
      vehicles: await Vehicle.count(),
      drivers: await Driver.count(),
      trips: await Trip.count(),
      fuelLogs: await FuelLog.count(),
      maintenance: await Maintenance.count(),
      alerts: await Alert.count(),
    };

    console.log('📊 Current database counts:', counts);

    // Seed database
    console.log('\n🌱 Seeding database with initial data...');
    await seedDatabase(); // Make sure your seedDatabase function is Sequelize-ready
    console.log('🎉 Database seeding completed successfully!');

    console.log('\n📋 Next steps:');
    console.log('1. Your SQL database is now ready');
    console.log('2. Restart your backend server');
    console.log('3. Your frontend will now connect to real SQL data');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Disconnected from SQL database');
    process.exit(0);
  }
};

// Run the initialization
initDatabase();
