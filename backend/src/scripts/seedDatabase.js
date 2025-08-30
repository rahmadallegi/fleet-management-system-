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

    // Create a default admin user first
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
        engine: {
          type: 'gasoline',
          displacement: 2.0,
          power: 150
        },
        capacity: {
          passengers: 2,
          cargo: {
            weight: 1200,
            volume: 8.5
          }
        },
        odometer: {
          current: 45230,
          unit: 'km'
        },
        fuelLevel: 75,
        registration: {
          number: 'REG001',
          expiryDate: new Date('2025-12-31')
        },
        insurance: {
          policyNumber: 'INS001',
          provider: 'Fleet Insurance Co',
          expiryDate: new Date('2025-06-30')
        },
        createdBy: adminUser.id,
        lastMaintenance: new Date('2024-01-15')
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
        engine: {
          type: 'diesel',
          displacement: 2.1,
          power: 180
        },
        capacity: {
          passengers: 3,
          cargo: {
            weight: 1500,
            volume: 10.2
          }
        },
        odometer: {
          current: 23450,
          unit: 'km'
        },
        fuelLevel: 60,
        registration: {
          number: 'REG002',
          expiryDate: new Date('2025-11-30')
        },
        insurance: {
          policyNumber: 'INS002',
          provider: 'Fleet Insurance Co',
          expiryDate: new Date('2025-05-15')
        },
        createdBy: adminUser.id,
        lastMaintenance: new Date('2024-01-10')
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
        engine: {
          type: 'diesel',
          displacement: 3.0,
          power: 220
        },
        capacity: {
          passengers: 2,
          cargo: {
            weight: 3000,
            volume: 15.5
          }
        },
        odometer: {
          current: 67890,
          unit: 'km'
        },
        fuelLevel: 30,
        registration: {
          number: 'REG003',
          expiryDate: new Date('2025-10-15')
        },
        insurance: {
          policyNumber: 'INS003',
          provider: 'Fleet Insurance Co',
          expiryDate: new Date('2025-04-20')
        },
        createdBy: adminUser.id,
        lastMaintenance: new Date('2024-01-20')
      }
    ]);

    console.log('🚗 Seeded vehicles');

    // Seed Drivers
    const drivers = await Driver.bulkCreate([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@fleetco.com',
        phone: {
          primary: '+1 (555) 123-4567',
          secondary: '+1 (555) 123-4568'
        },
        employeeId: 'EMP001',
        dateOfBirth: new Date('1985-03-15'),
        status: 'active',
        availability: 'available',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        license: {
          number: 'D123456789',
          class: 'CDL-A',
          state: 'NY',
          issueDate: new Date('2020-01-15'),
          expiryDate: new Date('2025-12-31'),
          restrictions: []
        },
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '+1 (555) 987-6543'
        },
        performance: {
          rating: 4.8,
          totalTrips: 156,
          safetyScore: 95
        },
        hireDate: new Date('2022-01-15'),
        createdBy: adminUser.id
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@fleetco.com',
        phone: {
          primary: '+1 (555) 987-6543',
          secondary: '+1 (555) 987-6544'
        },
        employeeId: 'EMP002',
        dateOfBirth: new Date('1990-07-22'),
        status: 'active',
        availability: 'on-duty',
        address: {
          street: '456 Oak Ave',
          city: 'Brooklyn',
          state: 'NY',
          zipCode: '11201',
          country: 'USA'
        },
        license: {
          number: 'D987654321',
          class: 'C',
          state: 'NY',
          issueDate: new Date('2019-05-10'),
          expiryDate: new Date('2026-06-15'),
          restrictions: []
        },
        emergencyContact: {
          name: 'Mike Johnson',
          relationship: 'Brother',
          phone: '+1 (555) 456-7890'
        },
        performance: {
          rating: 4.9,
          totalTrips: 203,
          safetyScore: 98
        },
        hireDate: new Date('2021-08-01'),
        createdBy: adminUser.id
      },
      {
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@fleetco.com',
        phone: {
          primary: '+1 (555) 456-7890',
          secondary: '+1 (555) 456-7891'
        },
        employeeId: 'EMP003',
        dateOfBirth: new Date('1988-11-05'),
        status: 'inactive',
        availability: 'unavailable',
        address: {
          street: '789 Pine St',
          city: 'Queens',
          state: 'NY',
          zipCode: '11375',
          country: 'USA'
        },
        license: {
          number: 'D456789123',
          class: 'CDL-B',
          state: 'NY',
          issueDate: new Date('2021-03-01'),
          expiryDate: new Date('2026-03-20'),
          restrictions: []
        },
        emergencyContact: {
          name: 'Lisa Wilson',
          relationship: 'Wife',
          phone: '+1 (555) 321-0987'
        },
        performance: {
          rating: 4.2,
          totalTrips: 89,
          safetyScore: 87
        },
        hireDate: new Date('2023-02-15'),
        createdBy: adminUser.id
      }
    ]);

    console.log('👥 Seeded drivers');

    // Seed Trips
    const trips = await Trip.bulkCreate([
      {
        tripNumber: 'TRP-001',
        purpose: 'delivery',
        description: 'Deliver office supplies to downtown location',
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        status: 'in-progress',
        priority: 'high',
        schedule: {
          plannedStart: new Date('2024-01-25T09:00:00'),
          plannedEnd: new Date('2024-01-25T17:00:00'),
          actualStart: new Date('2024-01-25T09:15:00')
        },
        route: {
          origin: {
            address: '123 Main St, New York, NY',
            coordinates: { lat: 40.7128, lng: -74.0060 }
          },
          destination: {
            address: '456 Oak Ave, Brooklyn, NY',
            coordinates: { lat: 40.6782, lng: -73.9442 }
          },
          estimatedDistance: { value: 45, unit: 'km' }
        },
        createdBy: adminUser.id
      },
      {
        tripNumber: 'TRP-002',
        purpose: 'transport',
        description: 'Transport team to client meeting',
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        status: 'planned',
        priority: 'normal',
        schedule: {
          plannedStart: new Date('2024-01-26T10:00:00'),
          plannedEnd: new Date('2024-01-26T15:00:00')
        },
        route: {
          origin: {
            address: '789 Pine St, Queens, NY',
            coordinates: { lat: 40.7282, lng: -73.7949 }
          },
          destination: {
            address: '321 Elm St, Manhattan, NY',
            coordinates: { lat: 40.7589, lng: -73.9851 }
          },
          estimatedDistance: { value: 32, unit: 'km' }
        },
        createdBy: adminUser.id
      }
    ]);

    console.log('🚛 Seeded trips');

    // Seed Fuel Logs
    await FuelLog.bulkCreate([
      {
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        date: new Date('2024-01-25'),
        time: '14:30',
        fuelType: 'gasoline',
        quantity: { amount: 45.5, unit: 'liters' },
        cost: { pricePerUnit: 1.45, totalAmount: 65.98, currency: 'USD' },
        odometer: { reading: 45230, unit: 'km' },
        location: {
          stationName: 'Shell Station',
          address: '123 Main St, New York, NY'
        },
        payment: {
          method: 'fuel-card',
          cardNumber: '****1234'
        },
        isFillUp: true,
        status: 'approved',
        createdBy: adminUser.id
      },
      {
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        date: new Date('2024-01-24'),
        time: '09:15',
        fuelType: 'diesel',
        quantity: { amount: 38.2, unit: 'liters' },
        cost: { pricePerUnit: 1.52, totalAmount: 58.06, currency: 'USD' },
        odometer: { reading: 23450, unit: 'km' },
        location: {
          stationName: 'BP Station',
          address: '456 Oak Ave, Brooklyn, NY'
        },
        payment: {
          method: 'credit-card',
          cardNumber: '****5678'
        },
        isFillUp: false,
        status: 'pending',
        createdBy: adminUser.id
      }
    ]);

    console.log('⛽ Seeded fuel logs');

    // Seed Maintenance Records
    await Maintenance.bulkCreate([
      {
        vehicleId: vehicles[0].id,
        type: 'oil-change',
        category: 'engine',
        title: 'Oil Change Service',
        description: 'Regular oil change and filter replacement',
        status: 'scheduled',
        priority: 'normal',
        scheduledDate: new Date('2024-02-01'),
        estimatedCost: 85.00,
        odometer: { reading: 45000, unit: 'km' },
        serviceProvider: {
          type: 'external',
          name: 'AutoCare Center',
          contact: {
            phone: '+1 (555) 123-0000',
            email: 'service@autocare.com'
          }
        },
        workOrder: {
          number: 'WO-001',
          description: 'Regular oil change and filter replacement service'
        },
        createdBy: adminUser.id
      },
      {
        vehicleId: vehicles[1].id,
        type: 'brake-service',
        category: 'brakes',
        title: 'Brake Pad Replacement',
        description: 'Front brake pads need replacement',
        status: 'in-progress',
        priority: 'high',
        scheduledDate: new Date('2024-01-28'),
        estimatedCost: 320.00,
        actualCost: 285.00,
        odometer: { reading: 23500, unit: 'km' },
        serviceProvider: {
          type: 'external',
          name: 'Brake Specialists Inc',
          contact: {
            phone: '+1 (555) 456-0000',
            email: 'service@brakespecialists.com'
          }
        },
        workOrder: {
          number: 'WO-002',
          description: 'Replace front brake pads and inspect brake system'
        },
        createdBy: adminUser.id
      }
    ]);

    console.log('🔧 Seeded maintenance records');

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:
    - ${vehicles.length} vehicles
    - ${drivers.length} drivers  
    - ${trips.length} trips
    - 2 fuel logs
    - 2 maintenance records`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

export default seedDatabase;
