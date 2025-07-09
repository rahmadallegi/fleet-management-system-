import mongoose from 'mongoose';
import { Vehicle, Driver, Trip, FuelLog, Maintenance, Alert } from '../models/index.js';

const checkData = async () => {
  try {
    console.log('🔌 Connecting to database...');
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet-management');
    }
    
    console.log('✅ Database connected');
    
    // Check all collections
    const vehicleCount = await Vehicle.countDocuments();
    const driverCount = await Driver.countDocuments();
    const tripCount = await Trip.countDocuments();
    const fuelLogCount = await FuelLog.countDocuments();
    const maintenanceCount = await Maintenance.countDocuments();
    const alertCount = await Alert.countDocuments();
    
    console.log('📊 Database counts:');
    console.log(`  Vehicles: ${vehicleCount}`);
    console.log(`  Drivers: ${driverCount}`);
    console.log(`  Trips: ${tripCount}`);
    console.log(`  Fuel Logs: ${fuelLogCount}`);
    console.log(`  Maintenance: ${maintenanceCount}`);
    console.log(`  Alerts: ${alertCount}`);
    
    if (vehicleCount > 0) {
      const vehicles = await Vehicle.find().limit(3);
      console.log('\n🚗 Sample vehicles:');
      vehicles.forEach(v => {
        console.log(`  - ${v.plateNumber}: ${v.make} ${v.model} (${v.status})`);
      });
    }
    
    if (driverCount > 0) {
      const drivers = await Driver.find().limit(3);
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
