import mongoose from 'mongoose';
import User from '../models/User.js';

const testAuth = async () => {
  try {
    console.log('🔌 Connecting to database...');
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet-management');
    }
    
    console.log('✅ Database connected');
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@fleet.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Admin user found:', {
      id: adminUser._id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      hasPassword: !!adminUser.password
    });
    
    // Test password comparison
    const testPassword = 'admin123';
    const isPasswordValid = await adminUser.comparePassword(testPassword);
    
    console.log(`🔐 Password test for "${testPassword}":`, isPasswordValid ? '✅ Valid' : '❌ Invalid');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAuth();
