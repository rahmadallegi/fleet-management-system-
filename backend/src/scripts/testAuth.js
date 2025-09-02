import sequelize from '../config/sequelize.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const testAuth = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find the admin user
    const adminUser = await User.findOne({ where: { email: 'admin@fleet.com' } });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(0);
    }

    console.log('👤 Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      hasPassword: !!adminUser.password
    });

    // Test password comparison
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);

    console.log(`🔐 Password test for "${testPassword}":`, isPasswordValid ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
};

testAuth();
