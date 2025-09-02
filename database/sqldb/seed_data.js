import sequelize from '../../src/config/sequelize.js';
import { User, Vehicle, Driver, Trip, FuelLog, Maintenance, Alert } from '../../src/models/index.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting SQL database seeding...');

    // Reset database
    await sequelize.sync({ force: true });
    console.log('🗑️ Cleared existing data');

    // Seed Users
    const users = await User.bulkCreate([
      {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        name: 'John Admin',
        email: 'admin@fleet.com',
        password: '$2b$10$hashedpassword1',
        role: 'admin',
        status: 'active',
        phone: '+1-555-0101',
        address: '123 Admin St, City, State 12345',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        lastLogin: new Date('2024-01-15T08:30:00Z')
      },
      {
        id: '1c9e6679-7425-40de-944b-e07fc1f90ae7',
        name: 'Sarah Manager',
        email: 'manager@fleet.com',
        password: '$2b$10$hashedpassword2',
        role: 'manager',
        status: 'active',
        phone: '+1-555-0202',
        address: '456 Manager Rd, City, State 54321',
        createdAt: new Date('2024-01-02T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        lastLogin: new Date('2024-01-18T09:45:00Z')
      }
    ]);
    console.log('👨‍💻 Users seeded');

    // Seed Drivers
    const drivers = await Driver.bulkCreate([
      {
        firstName: 'Alex',
        lastName: 'Johnson',
        licenseNumber: 'DL123456',
        phone: '+1-555-0303',
        status: 'active'
      },
      {
        firstName: 'Maria',
        lastName: 'Lopez',
        licenseNumber: 'DL654321',
        phone: '+1-555-0404',
        status: 'active'
      }
    ]);
    console.log('👨‍✈️ Drivers seeded');

    // Seed Vehicles
    const vehicles = await Vehicle.bulkCreate([
      {
        plateNumber: 'FL-001',
        make: 'Ford',
        model: 'Transit',
        year: 2022,
        type: 'van',
        status: 'active',
        fuelType: 'gasoline',
        odometer: 45230,
        currentDriverId: drivers[0].id
      },
      {
        plateNumber: 'FL-002',
        make: 'Mercedes',
        model: 'Sprinter',
        year: 2023,
        type: 'van',
        status: 'active',
        fuelType: 'diesel',
        odometer: 23450,
        currentDriverId: drivers[1].id
      }
    ]);
    console.log('🚗 Vehicles seeded');

    // Example Trip
    await Trip.create({
      vehicleId: vehicles[0].id,
      driverId: drivers[0].id,
      startLocation: 'City A',
      endLocation: 'City B',
      status: 'completed',
      distance: 150,
      startedAt: new Date('2024-02-01T08:00:00Z'),
      endedAt: new Date('2024-02-01T11:00:00Z')
    });
    console.log('🗺️ Trips seeded');

    // Example Fuel Log
    await FuelLog.create({
      vehicleId: vehicles[0].id,
      liters: 50,
      cost: 70.5,
      filledAt: new Date('2024-02-02T10:30:00Z')
    });
    console.log('⛽ Fuel logs seeded');

    // Example Maintenance
    await Maintenance.create({
      vehicleId: vehicles[0].id,
      type: 'oil change',
      description: 'Changed oil and filter',
      cost: 120.0,
      date: new Date('2024-02-05T14:00:00Z')
    });
    console.log('🔧 Maintenance seeded');

    // Example Alert
    await Alert.create({
      type: 'maintenance',
      message: 'Oil change required for vehicle FL-001',
      vehicleId: vehicles[0].id,
      severity: 'high',
      createdAt: new Date('2024-02-06T09:00:00Z')
    });
    console.log('🚨 Alerts seeded');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connection closed');
  }
};

seedDatabase();
