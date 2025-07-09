// Fleet Management System - Database Setup Script
// This script sets up the MongoDB database with collections and sample data

const { MongoClient } = require('mongodb');

// Database configuration
const DB_CONFIG = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: 'fleet_management'
};

// Sample data
const sampleData = {
  users: [
    {
      name: "John Admin",
      email: "admin@fleet.com",
      password: "$2b$10$hashedpassword1",
      role: "admin",
      status: "active",
      phone: "+1-555-0101",
      address: "123 Admin St, City, State 12345",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      lastLogin: new Date("2024-01-15T08:30:00Z")
    },
    {
      name: "Mike User",
      email: "user@fleet.com",
      password: "$2b$10$hashedpassword3",
      role: "user",
      status: "active",
      phone: "+1-555-0103",
      address: "789 User Blvd, City, State 12347",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      lastLogin: new Date("2024-01-15T09:15:00Z")
    },
    {
      name: "Lisa Warehouse",
      email: "warehouse@fleet.com",
      password: "$2b$10$hashedpassword4",
      role: "warehouse",
      status: "active",
      phone: "+1-555-0104",
      address: "321 Warehouse Dr, City, State 12348",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      lastLogin: new Date("2024-01-15T07:20:00Z")
    }
  ],

  drivers: [
    {
      employeeId: "EMP001",
      firstName: "Robert",
      lastName: "Johnson",
      email: "robert.johnson@fleet.com",
      phone: "+1-555-1001",
      licenseNumber: "DL123456789",
      licenseExpiry: new Date("2025-12-31"),
      dateOfBirth: new Date("1985-03-15"),
      hireDate: new Date("2020-01-15"),
      status: "active",
      availability: "available",
      address: "111 Driver St, City, State 12345",
      emergencyContact: {
        name: "Mary Johnson",
        phone: "+1-555-1101"
      },
      createdAt: new Date("2020-01-15T00:00:00Z"),
      updatedAt: new Date("2024-01-15T00:00:00Z")
    },
    {
      employeeId: "EMP002",
      firstName: "Jennifer",
      lastName: "Williams",
      email: "jennifer.williams@fleet.com",
      phone: "+1-555-1002",
      licenseNumber: "DL987654321",
      licenseExpiry: new Date("2026-06-30"),
      dateOfBirth: new Date("1990-07-22"),
      hireDate: new Date("2021-03-10"),
      status: "active",
      availability: "on-duty",
      address: "222 Driver Ave, City, State 12346",
      emergencyContact: {
        name: "James Williams",
        phone: "+1-555-1102"
      },
      createdAt: new Date("2021-03-10T00:00:00Z"),
      updatedAt: new Date("2024-01-15T00:00:00Z")
    }
  ],

  vehicles: [
    {
      plateNumber: "ABC-123",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      color: "White",
      vin: "1HGBH41JXMN109186",
      fuelType: "gasoline",
      capacity: 5,
      mileage: 15420.50,
      status: "active",
      purchaseDate: new Date("2022-01-15"),
      purchasePrice: 28500.00,
      insurance: {
        policy: "POL-2022-001",
        expiry: new Date("2024-12-31")
      },
      registration: {
        expiry: new Date("2024-12-31")
      },
      currentDriver: {
        name: "Robert Johnson",
        employeeId: "EMP001"
      },
      createdAt: new Date("2022-01-15T00:00:00Z"),
      updatedAt: new Date("2024-01-15T00:00:00Z")
    },
    {
      plateNumber: "XYZ-789",
      make: "Honda",
      model: "Accord",
      year: 2021,
      color: "Silver",
      vin: "2HGBH41JXMN109187",
      fuelType: "gasoline",
      capacity: 5,
      mileage: 22150.75,
      status: "active",
      purchaseDate: new Date("2021-06-20"),
      purchasePrice: 26800.00,
      insurance: {
        policy: "POL-2021-002",
        expiry: new Date("2024-12-31")
      },
      registration: {
        expiry: new Date("2024-12-31")
      },
      currentDriver: {
        name: "Jennifer Williams",
        employeeId: "EMP002"
      },
      createdAt: new Date("2021-06-20T00:00:00Z"),
      updatedAt: new Date("2024-01-15T00:00:00Z")
    }
  ]
};

// Database setup function
async function setupDatabase() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(DB_CONFIG.url);
    await client.connect();
    
    const db = client.db(DB_CONFIG.dbName);
    console.log(`✅ Connected to database: ${DB_CONFIG.dbName}`);

    // Create collections and insert sample data
    console.log('📊 Setting up collections...');

    // Users collection
    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({}); // Clear existing data
    await usersCollection.insertMany(sampleData.users);
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    console.log('✅ Users collection setup complete');

    // Drivers collection
    const driversCollection = db.collection('drivers');
    await driversCollection.deleteMany({});
    await driversCollection.insertMany(sampleData.drivers);
    await driversCollection.createIndex({ employeeId: 1 }, { unique: true });
    await driversCollection.createIndex({ email: 1 }, { unique: true });
    await driversCollection.createIndex({ licenseNumber: 1 }, { unique: true });
    console.log('✅ Drivers collection setup complete');

    // Vehicles collection
    const vehiclesCollection = db.collection('vehicles');
    await vehiclesCollection.deleteMany({});
    await vehiclesCollection.insertMany(sampleData.vehicles);
    await vehiclesCollection.createIndex({ plateNumber: 1 }, { unique: true });
    await vehiclesCollection.createIndex({ status: 1 });
    console.log('✅ Vehicles collection setup complete');

    // Create other collections with indexes
    const collections = [
      'trips',
      'fuelLogs',
      'maintenanceRecords',
      'requests',
      'alerts'
    ];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});
      console.log(`✅ ${collectionName} collection setup complete`);
    }

    // Create additional indexes
    await db.collection('trips').createIndex({ tripNumber: 1 }, { unique: true });
    await db.collection('trips').createIndex({ status: 1 });
    await db.collection('requests').createIndex({ requestNumber: 1 }, { unique: true });
    await db.collection('alerts').createIndex({ alertId: 1 }, { unique: true });

    console.log('🎯 Database setup completed successfully!');
    console.log('📈 Sample data inserted for testing');
    console.log('🔍 Indexes created for optimal performance');

    // Display summary
    const userCount = await usersCollection.countDocuments();
    const driverCount = await driversCollection.countDocuments();
    const vehicleCount = await vehiclesCollection.countDocuments();

    console.log('\n📊 DATABASE SUMMARY:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🚗 Drivers: ${driverCount}`);
    console.log(`🚙 Vehicles: ${vehicleCount}`);
    console.log('\n🎉 Fleet Management System database is ready!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, sampleData };
