import sequelize from '../config/sequelize.js';
import { User, Vehicle, Driver, Trip, FuelLog, Maintenance } from '../models/index.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Maintenance.destroy({ where: {} });
    await FuelLog.destroy({ where: {} });
    await Trip.destroy({ where: {} });
    await Vehicle.destroy({ where: {} });
    await Driver.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('🗑️ Cleared existing data');

    // Create default admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@fleet.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    console.log('👤 Created admin user');

    // Seed Vehicles
    const vehicles = await Vehicle.bulkCreate([
      {
        plateNumber: 'FL-001',
        make: 'Ford',
        model: 'Transit',
        year: 2022,
        type: 'van',
        color: 'White',
        vin: 'WF0XXXTTGXDA12345',
        status: 'active',
        availability: 'available',
        fuelType: 'gasoline',
        transmission: 'manual',
        engine: { type: 'gasoline', displacement: 2.0, power: 150 },
        capacity: { passengers: 2, cargo: { weight: 1200, volume: 8.5 } },
        odometer: { current: 45230, unit: 'km' },
        fuelLevel: 75,
        registration: { number: 'REG001', expiryDate: '2025-12-31' },
        insurance: { policyNumber: 'INS001', provider: 'Fleet Insurance Co', expiryDate: '2025-06-30' },
        createdById: adminUser.id,
        lastMaintenance: '2024-01-15'
      },
      {
        plateNumber: 'FL-002',
        make: 'Mercedes',
        model: 'Sprinter',
        year: 2023,
        type: 'van',
        color: 'Silver',
        vin: 'WDF9066131234567',
        status: 'active',
        availability: 'in-use',
        fuelType: 'diesel',
        transmission: 'automatic',
        engine: { type: 'diesel', displacement: 2.1, power: 180 },
        capacity: { passengers: 3, cargo: { weight: 1500, volume: 10.2 } },
        odometer: { current: 23450, unit: 'km' },
        fuelLevel: 60,
        registration: { number: 'REG002', expiryDate: '2025-11-30' },
        insurance: { policyNumber: 'INS002', provider: 'Fleet Insurance Co', expiryDate: '2025-05-15' },
        createdById: adminUser.id,
        lastMaintenance: '2024-01-10'
      },
      {
        plateNumber: 'FL-003',
        make: 'Isuzu',
        model: 'NPR',
        year: 2021,
        type: 'truck',
        color: 'Blue',
        vin: 'JALC4B16X12345678',
        status: 'maintenance',
        availability: 'maintenance',
        fuelType: 'diesel',
        transmission: 'manual',
        engine: { type: 'diesel', displacement: 3.0, power: 220 },
        capacity: { passengers: 2, cargo: { weight: 3000, volume: 15.5 } },
        odometer: { current: 67890, unit: 'km' },
        fuelLevel: 30,
        registration: { number: 'REG003', expiryDate: '2025-10-15' },
        insurance: { policyNumber: 'INS003', provider: 'Fleet Insurance Co', expiryDate: '2025-04-20' },
        createdById: adminUser.id,
        lastMaintenance: '2024-01-20'
      }
    ]);

    console.log('🚗 Seeded vehicles');

    // Seed Drivers
    const drivers = await Driver.bulkCreate([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@fleetco.com',
        phone: { primary: '+1 (555) 123-4567', secondary: '+1 (555) 123-4568' },
        employeeId: 'EMP001',
        dateOfBirth: '1985-03-15',
        status: 'active',
        availability: 'available',
        address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
        license: { number: 'D123456789', class: 'CDL-A', state: 'NY', issueDate: '2020-01-15', expiryDate: '2025-12-31', restrictions: [] },
        emergencyContact: { name: 'Jane Smith', relationship: 'Spouse', phone: '+1 (555) 987-6543' },
        performance: { rating: 4.8, totalTrips: 156, safetyScore: 95 },
        hireDate: '2022-01-15',
        createdById: adminUser.id
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@fleetco.com',
        phone: { primary: '+1 (555) 987-6543', secondary: '+1 (555) 987-6544' },
        employeeId: 'EMP002',
        dateOfBirth: '1990-07-22',
        status: 'active',
        availability: 'on-duty',
        address: { street: '456 Oak Ave', city: 'Brooklyn', state: 'NY', zipCode: '11201', country: 'USA' },
        license: { number: 'D987654321', class: 'C', state: 'NY', issueDate: '2019-05-10', expiryDate: '2026-06-15', restrictions: [] },
        emergencyContact: { name: 'Mike Johnson', relationship: 'Brother', phone: '+1 (555) 456-7890' },
        performance: { rating: 4.9, totalTrips: 203, safetyScore: 98 },
        hireDate: '2021-08-01',
        createdById: adminUser.id
      },
      {
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@fleetco.com',
        phone: { primary: '+1 (555) 456-7890', secondary: '+1 (555) 456-7891' },
        employeeId: 'EMP003',
        dateOfBirth: '1988-11-05',
        status: 'inactive',
        availability: 'unavailable',
        address: { street: '789 Pine St', city: 'Queens', state: 'NY', zipCode: '11375', country: 'USA' },
        license: { number: 'D456789123', class: 'CDL-B', state: 'NY', issueDate: '2021-03-01', expiryDate: '2026-03-20', restrictions: [] },
        emergencyContact: { name: 'Lisa Wilson', relationship: 'Wife', phone: '+1 (555) 321-0987' },
        performance: { rating: 4.2, totalTrips: 89, safetyScore: 87 },
        hireDate: '2023-02-15',
        createdById: adminUser.id
      }
    ]);

    console.log('👥 Seeded drivers');

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:
    - ${vehicles.length} vehicles
    - ${drivers.length} drivers`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

export default seedDatabase;
