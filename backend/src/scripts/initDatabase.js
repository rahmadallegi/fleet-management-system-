import mongoose from 'mongoose';
import seedDatabase from './seedDatabase.js';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet-management';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB successfully!');
    console.log(`📍 Database: ${mongoURI}`);

    // Test the connection
    const db = mongoose.connection.db;
    const admin = db.admin();
    const info = await admin.serverStatus();
    
    console.log(`🗄️ MongoDB Version: ${info.version}`);
    console.log(`💾 Database Name: ${db.databaseName}`);

    // Seed the database with initial data
    console.log('\n🌱 Seeding database with initial data...');
    await seedDatabase();

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Your database is now ready');
    console.log('2. Restart your backend server');
    console.log('3. Your frontend will now connect to real data');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 MongoDB Connection Issue:');
      console.log('1. Make sure MongoDB is installed');
      console.log('2. Start MongoDB service: net start MongoDB');
      console.log('3. Or install MongoDB from: https://www.mongodb.com/try/download/community');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the initialization
initDatabase();
