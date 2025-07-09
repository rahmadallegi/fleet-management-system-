import mongoose from 'mongoose';
import seedDatabase from './seedDatabase.js';
import '../config/database.js';

const runSeed = async () => {
  try {
    console.log('🔌 Connecting to database...');
    
    // Wait for database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet-management');
    }
    
    console.log('✅ Database connected');
    
    // Run seeding
    await seedDatabase();
    
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error running seed:', error);
    process.exit(1);
  }
};

runSeed();
