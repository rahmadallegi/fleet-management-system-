import mongoose from 'mongoose';
import User from '../models/User.js';

const testLogin = async () => {
  try {
    console.log('🔌 Connecting to database...');
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet-management');
    }
    
    console.log('✅ Database connected');
    
    const email = 'admin@fleet.com';
    const password = 'admin123';
    
    console.log(`🔍 Testing login for: ${email}`);
    
    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isLocked: user.isLocked,
      loginAttempts: user.loginAttempts,
      hasPassword: !!user.password
    });
    
    // Check if account is locked
    if (user.isLocked) {
      console.log('❌ Account is locked');
      return;
    }
    
    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account is inactive');
      return;
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log(`🔐 Password validation:`, isPasswordValid ? '✅ Valid' : '❌ Invalid');
    
    if (isPasswordValid) {
      console.log('🎉 Login would succeed!');
    } else {
      console.log('❌ Login would fail');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testLogin();
