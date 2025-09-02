import sequelize from '../config/sequelize.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const testLogin = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = 'admin@fleet.com';
    const password = 'admin123';

    console.log(`🔍 Testing login for: ${email}`);

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', {
      id: user.id,
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
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password validation:`, isPasswordValid ? '✅ Valid' : '❌ Invalid');

    if (isPasswordValid) {
      console.log('🎉 Login would succeed!');
    } else {
      console.log('❌ Login would fail');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
};

testLogin();
