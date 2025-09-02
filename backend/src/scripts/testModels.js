import sequelize from '../config/sequelize.js';
import { User, Vehicle, Driver, Trip, FuelLog, Maintenance, Alert } from '../models/index.js';

const testModels = async () => {
  try {
    console.log('🧪 Testing models...');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    const userCount = await User.count();
    console.log(`👨‍💻 Users: ${userCount}`);

    const vehicleCount = await Vehicle.count();
    console.log(`🚗 Vehicles: ${vehicleCount}`);

    const driverCount = await Driver.count();
    console.log(`👨‍✈️ Drivers: ${driverCount}`);

    const tripCount = await Trip.count();
    console.log(`🗺️ Trips: ${tripCount}`);

    const fuelLogCount = await FuelLog.count();
    console.log(`⛽ Fuel Logs: ${fuelLogCount}`);

    const maintenanceCount = await Maintenance.count();
    console.log(`🔧 Maintenance: ${maintenanceCount}`);

    const alertCount = await Alert.count();
    console.log(`🚨 Alerts: ${alertCount}`);

    console.log('✅ All models are working correctly!');

  } catch (error) {
    console.error('❌ Error testing models:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
};

testModels();
