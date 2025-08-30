import sequelize from '../config/sequelize.js';
import { Vehicle, Driver, Trip, FuelLog, Maintenance, Alert } from '../models/index.js';

const checkData = async () => {
  try {
    console.log('🔌 Connecting to database...');
    
    await sequelize.authenticate();
    
    console.log('✅ Database connected');
    
    // Check all collections
    const vehicleCount = await Vehicle.count();
    const driverCount = await Driver.count();
    const tripCount = await Trip.count();
    const fuelLogCount = await FuelLog.count();
    const maintenanceCount = await Maintenance.count();
    const alertCount = await Alert.count();
    
    console.log('📊 Database counts:');
    console.log(`  Vehicles: ${vehicleCount}`);
    console.log(`  Drivers: ${driverCount}`);
    console.log(`  Trips: ${tripCount}`);
    console.log(`  Fuel Logs: ${fuelLogCount}`);
    console.log(`  Maintenance: ${maintenanceCount}`);
    console.log(`  Alerts: ${alertCount}`);
    
    if (vehicleCount > 0) {
      const vehicles = await Vehicle.findAll({ limit: 3 });
      console.log('\n🚗 Sample vehicles:');
      vehicles.forEach(v => {
        console.log(`  - ${v.plateNumber}: ${v.make} ${v.model} (${v.status})`);
      });
    }
    
    if (driverCount > 0) {
      const drivers = await Driver.findAll({ limit: 3 });
      console.log('\n👥 Sample drivers:');
      drivers.forEach(d => {
        console.log(`  - ${d.firstName} ${d.lastName}: ${d.email} (${d.status})`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();


