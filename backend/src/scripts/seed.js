import sequelize from '../config/sequelize.js';
import Vehicle from '../models/Vehicle.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await sequelize.sync({ force: true });

    console.log('🗑️ Cleared existing data');

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
        lastMaintenance: new Date('2024-01-20')
      }
    ]);

    console.log('🚗 Seeded vehicles');

    console.log('✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();