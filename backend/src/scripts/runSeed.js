import sequelize from '../config/sequelize.js';
import seedDatabase from './seedDatabase.js'; // Make sure this is Sequelize-compatible
import dotenv from 'dotenv';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('🔌 Connecting to SQL database...');

    // Authenticate connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Optional: ensure tables exist
    await sequelize.sync({ alter: true });
    console.log('🗄️ Models synced successfully');

    // Run seeding
    console.log('\n🌱 Running database seed...');
    await seedDatabase(); // Must be updated to use Sequelize models
    console.log('🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error running seed:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
};

// Run the seeding script
runSeed();
