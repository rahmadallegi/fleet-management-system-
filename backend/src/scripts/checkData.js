import sequelize from '../config/sequelize.js';
import { Vehicle, Driver, Trip, FuelLog, Maintenance, Alert, User } from '../models/index.js';

const checkData = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const counts = {
      vehicles: await Vehicle.count(),
      drivers: await Driver.count(),
      trips: await Trip.count(),
      fuelLogs: await FuelLog.count(),
      maintenance: await Maintenance.count(),
      alerts: await Alert.count(),
      users: await User.count(),
    };

    console.log('📊 Database counts:', counts);

    if (counts.vehicles > 0) {
      const vehicles = await Vehicle.findAll({ limit: 3 });
      console.log('\n🚗 Sample vehicles:');
      vehicles.forEach(v => console.log(`  - ${v.plateNumber}: ${v.make} ${v.model} (${v.status})`));
    }

    if (counts.drivers > 0) {
      const drivers = await Driver.findAll({ limit: 3 });
      console.log('\n👥 Sample drivers:');
      drivers.forEach(d => console.log(`  - ${d.firstName} ${d.lastName}: ${d.email} (${d.status})`));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
