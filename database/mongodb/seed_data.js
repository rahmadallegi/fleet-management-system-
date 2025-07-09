// Fleet Management System - MongoDB Seed Data
// Run this script to populate your MongoDB database with sample data

// Connect to MongoDB
use fleet_management;

// =============================================
// USERS COLLECTION
// =============================================
db.users.insertMany([
  {
    _id: ObjectId(),
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
    _id: ObjectId(),
    name: "Sarah Manager",
    email: "manager@fleet.com",
    password: "$2b$10$hashedpassword2",
    role: "admin",
    status: "active",
    phone: "+1-555-0102",
    address: "456 Manager Ave, City, State 12346",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    lastLogin: new Date("2024-01-14T16:45:00Z")
  },
  {
    _id: ObjectId(),
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
    _id: ObjectId(),
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
  },
  {
    _id: ObjectId(),
    name: "Tom Employee",
    email: "tom@fleet.com",
    password: "$2b$10$hashedpassword5",
    role: "user",
    status: "active",
    phone: "+1-555-0105",
    address: "654 Employee Ln, City, State 12349",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    lastLogin: new Date("2024-01-13T14:30:00Z")
  }
]);

// =============================================
// DRIVERS COLLECTION
// =============================================
db.drivers.insertMany([
  {
    _id: ObjectId(),
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
    _id: ObjectId(),
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
  },
  {
    _id: ObjectId(),
    employeeId: "EMP003",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@fleet.com",
    phone: "+1-555-1003",
    licenseNumber: "DL456789123",
    licenseExpiry: new Date("2025-09-15"),
    dateOfBirth: new Date("1988-11-08"),
    hireDate: new Date("2019-08-20"),
    status: "active",
    availability: "available",
    address: "333 Driver Blvd, City, State 12347",
    emergencyContact: {
      name: "Susan Brown",
      phone: "+1-555-1103"
    },
    createdAt: new Date("2019-08-20T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
    employeeId: "EMP004",
    firstName: "Sarah",
    lastName: "Davis",
    email: "sarah.davis@fleet.com",
    phone: "+1-555-1004",
    licenseNumber: "DL789123456",
    licenseExpiry: new Date("2026-03-20"),
    dateOfBirth: new Date("1992-05-12"),
    hireDate: new Date("2022-01-05"),
    status: "active",
    availability: "off-duty",
    address: "444 Driver Dr, City, State 12348",
    emergencyContact: {
      name: "John Davis",
      phone: "+1-555-1104"
    },
    createdAt: new Date("2022-01-05T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
    employeeId: "EMP005",
    firstName: "Christopher",
    lastName: "Miller",
    email: "chris.miller@fleet.com",
    phone: "+1-555-1005",
    licenseNumber: "DL321654987",
    licenseExpiry: new Date("2025-11-10"),
    dateOfBirth: new Date("1987-09-30"),
    hireDate: new Date("2020-06-15"),
    status: "active",
    availability: "available",
    address: "555 Driver Ln, City, State 12349",
    emergencyContact: {
      name: "Lisa Miller",
      phone: "+1-555-1105"
    },
    createdAt: new Date("2020-06-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  }
]);

// =============================================
// VEHICLES COLLECTION
// =============================================
db.vehicles.insertMany([
  {
    _id: ObjectId(),
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
      id: ObjectId(),
      name: "Robert Johnson",
      employeeId: "EMP001"
    },
    createdAt: new Date("2022-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
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
      id: ObjectId(),
      name: "Jennifer Williams",
      employeeId: "EMP002"
    },
    createdAt: new Date("2021-06-20T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
    plateNumber: "DEF-456",
    make: "Ford",
    model: "Transit",
    year: 2023,
    color: "Blue",
    vin: "3HGBH41JXMN109188",
    fuelType: "diesel",
    capacity: 12,
    mileage: 8750.25,
    status: "active",
    purchaseDate: new Date("2023-03-10"),
    purchasePrice: 45200.00,
    insurance: {
      policy: "POL-2023-003",
      expiry: new Date("2024-12-31")
    },
    registration: {
      expiry: new Date("2024-12-31")
    },
    currentDriver: {
      id: ObjectId(),
      name: "Michael Brown",
      employeeId: "EMP003"
    },
    createdAt: new Date("2023-03-10T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
    plateNumber: "GHI-321",
    make: "Chevrolet",
    model: "Malibu",
    year: 2022,
    color: "Black",
    vin: "4HGBH41JXMN109189",
    fuelType: "gasoline",
    capacity: 5,
    mileage: 18900.00,
    status: "maintenance",
    purchaseDate: new Date("2022-08-05"),
    purchasePrice: 27300.00,
    insurance: {
      policy: "POL-2022-004",
      expiry: new Date("2024-12-31")
    },
    registration: {
      expiry: new Date("2024-12-31")
    },
    currentDriver: null,
    createdAt: new Date("2022-08-05T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
    plateNumber: "JKL-654",
    make: "Nissan",
    model: "Altima",
    year: 2021,
    color: "Red",
    vin: "5HGBH41JXMN109190",
    fuelType: "gasoline",
    capacity: 5,
    mileage: 31200.80,
    status: "active",
    purchaseDate: new Date("2021-11-12"),
    purchasePrice: 25900.00,
    insurance: {
      policy: "POL-2021-005",
      expiry: new Date("2024-12-31")
    },
    registration: {
      expiry: new Date("2024-12-31")
    },
    currentDriver: {
      id: ObjectId(),
      name: "Sarah Davis",
      employeeId: "EMP004"
    },
    createdAt: new Date("2021-11-12T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  }
]);

// =============================================
// TRIPS COLLECTION
// =============================================
db.trips.insertMany([
  {
    _id: ObjectId(),
    tripNumber: "TRP-001",
    vehicle: {
      id: ObjectId(),
      plateNumber: "ABC-123",
      make: "Toyota",
      model: "Camry"
    },
    driver: {
      id: ObjectId(),
      firstName: "Robert",
      lastName: "Johnson",
      employeeId: "EMP001"
    },
    startLocation: "Main Office",
    endLocation: "Downtown Branch",
    startTime: new Date("2024-01-15T09:00:00Z"),
    endTime: new Date("2024-01-15T10:30:00Z"),
    scheduledStart: new Date("2024-01-15T09:00:00Z"),
    scheduledEnd: new Date("2024-01-15T10:30:00Z"),
    distance: 25.5,
    purpose: "Client Meeting",
    status: "completed",
    passengerCount: 3,
    notes: "Successful client presentation",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-14T00:00:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z")
  },
  {
    _id: ObjectId(),
    tripNumber: "TRP-002",
    vehicle: {
      id: ObjectId(),
      plateNumber: "XYZ-789",
      make: "Honda",
      model: "Accord"
    },
    driver: {
      id: ObjectId(),
      firstName: "Jennifer",
      lastName: "Williams",
      employeeId: "EMP002"
    },
    startLocation: "Warehouse",
    endLocation: "Airport",
    startTime: new Date("2024-01-15T14:00:00Z"),
    endTime: null,
    scheduledStart: new Date("2024-01-15T14:00:00Z"),
    scheduledEnd: new Date("2024-01-15T16:00:00Z"),
    distance: 45.2,
    purpose: "Airport Pickup",
    status: "in-progress",
    passengerCount: 1,
    notes: "VIP client pickup",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-14T00:00:00Z"),
    updatedAt: new Date("2024-01-15T14:00:00Z")
  },
  {
    _id: ObjectId(),
    tripNumber: "TRP-003",
    vehicle: {
      id: ObjectId(),
      plateNumber: "DEF-456",
      make: "Ford",
      model: "Transit"
    },
    driver: {
      id: ObjectId(),
      firstName: "Michael",
      lastName: "Brown",
      employeeId: "EMP003"
    },
    startLocation: "Head Office",
    endLocation: "Regional Office",
    startTime: new Date("2024-01-16T08:00:00Z"),
    endTime: new Date("2024-01-16T12:00:00Z"),
    scheduledStart: new Date("2024-01-16T08:00:00Z"),
    scheduledEnd: new Date("2024-01-16T12:00:00Z"),
    distance: 120.8,
    purpose: "Team Transport",
    status: "completed",
    passengerCount: 8,
    notes: "Monthly team meeting",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-16T12:00:00Z")
  }
]);

// =============================================
// FUEL LOGS COLLECTION
// =============================================
db.fuelLogs.insertMany([
  {
    _id: ObjectId(),
    vehicle: {
      id: ObjectId(),
      plateNumber: "ABC-123",
      make: "Toyota",
      model: "Camry"
    },
    driver: {
      id: ObjectId(),
      firstName: "Robert",
      lastName: "Johnson",
      employeeId: "EMP001"
    },
    date: new Date("2024-01-10"),
    odometer: 15400.50,
    quantity: 45.2,
    cost: 67.80,
    fuelType: "gasoline",
    station: "Shell Station Downtown",
    receiptNumber: "RCP-001-2024",
    efficiency: 8.5,
    notes: "Regular fill-up",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-10T00:00:00Z"),
    updatedAt: new Date("2024-01-10T00:00:00Z")
  },
  {
    _id: ObjectId(),
    vehicle: {
      id: ObjectId(),
      plateNumber: "XYZ-789",
      make: "Honda",
      model: "Accord"
    },
    driver: {
      id: ObjectId(),
      firstName: "Jennifer",
      lastName: "Williams",
      employeeId: "EMP002"
    },
    date: new Date("2024-01-12"),
    odometer: 22100.75,
    quantity: 48.7,
    cost: 73.05,
    fuelType: "gasoline",
    station: "BP Gas Station",
    receiptNumber: "RCP-002-2024",
    efficiency: 7.8,
    notes: "Full tank",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-12T00:00:00Z"),
    updatedAt: new Date("2024-01-12T00:00:00Z")
  },
  {
    _id: ObjectId(),
    vehicle: {
      id: ObjectId(),
      plateNumber: "DEF-456",
      make: "Ford",
      model: "Transit"
    },
    driver: {
      id: ObjectId(),
      firstName: "Michael",
      lastName: "Brown",
      employeeId: "EMP003"
    },
    date: new Date("2024-01-08"),
    odometer: 8720.25,
    quantity: 65.3,
    cost: 98.45,
    fuelType: "diesel",
    station: "Diesel Depot",
    receiptNumber: "RCP-003-2024",
    efficiency: 6.2,
    notes: "Long trip preparation",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-08T00:00:00Z"),
    updatedAt: new Date("2024-01-08T00:00:00Z")
  }
]);

// =============================================
// MAINTENANCE RECORDS COLLECTION
// =============================================
db.maintenanceRecords.insertMany([
  {
    _id: ObjectId(),
    vehicle: {
      id: ObjectId(),
      plateNumber: "ABC-123",
      make: "Toyota",
      model: "Camry"
    },
    type: "scheduled",
    category: "oil-change",
    title: "Regular Oil Change",
    description: "5000km service - oil and filter change",
    scheduledDate: new Date("2024-01-20"),
    completedDate: null,
    status: "pending",
    priority: "medium",
    estimatedCost: 85.00,
    actualCost: null,
    serviceProvider: "Quick Lube Center",
    technician: "Mike Johnson",
    partsUsed: "Oil filter, 5L synthetic oil",
    notes: "Due for regular maintenance",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
    vehicle: {
      id: ObjectId(),
      plateNumber: "GHI-321",
      make: "Chevrolet",
      model: "Malibu"
    },
    type: "emergency",
    category: "brakes",
    title: "Brake Pad Replacement",
    description: "Front brake pads worn out, squeaking noise",
    scheduledDate: new Date("2024-01-16"),
    completedDate: new Date("2024-01-16"),
    status: "completed",
    priority: "high",
    estimatedCost: 250.00,
    actualCost: 275.50,
    serviceProvider: "Auto Service Pro",
    technician: "Sarah Wilson",
    partsUsed: "Front brake pads, brake fluid",
    notes: "Emergency repair completed successfully",
    createdBy: ObjectId(),
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-16T00:00:00Z")
  }
]);

// =============================================
// REQUESTS COLLECTION
// =============================================
db.requests.insertMany([
  {
    _id: ObjectId(),
    requestNumber: "REQ-001",
    user: {
      id: ObjectId(),
      name: "Mike User",
      email: "user@fleet.com"
    },
    type: "vehicle",
    title: "Vehicle for Client Meeting",
    description: "Need a vehicle for important client presentation downtown",
    priority: "high",
    status: "approved",
    requestedDate: new Date("2024-01-15"),
    requiredDate: new Date("2024-01-17"),
    approvedBy: {
      id: ObjectId(),
      name: "John Admin",
      email: "admin@fleet.com"
    },
    approvedAt: new Date("2024-01-15T10:30:00Z"),
    completedAt: null,
    rejectionReason: null,
    notes: "Approved for ABC-123",
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z")
  },
  {
    _id: ObjectId(),
    requestNumber: "REQ-002",
    user: {
      id: ObjectId(),
      name: "Tom Employee",
      email: "tom@fleet.com"
    },
    type: "equipment",
    title: "Laptop for Field Work",
    description: "Request for portable laptop for field data collection",
    priority: "medium",
    status: "pending",
    requestedDate: new Date("2024-01-16"),
    requiredDate: new Date("2024-01-20"),
    approvedBy: null,
    approvedAt: null,
    completedAt: null,
    rejectionReason: null,
    notes: "Waiting for IT approval",
    createdAt: new Date("2024-01-16T00:00:00Z"),
    updatedAt: new Date("2024-01-16T00:00:00Z")
  }
]);

// =============================================
// ALERTS COLLECTION
// =============================================
db.alerts.insertMany([
  {
    _id: ObjectId(),
    alertId: "ALT-001",
    type: "maintenance",
    severity: "warning",
    title: "Vehicle ABC-123 Due for Service",
    message: "Vehicle ABC-123 has reached 15,000km and is due for scheduled maintenance",
    relatedEntity: {
      type: "vehicle",
      id: ObjectId(),
      reference: "ABC-123"
    },
    isRead: false,
    isResolved: false,
    assignedTo: {
      id: ObjectId(),
      name: "John Admin",
      email: "admin@fleet.com"
    },
    expiresAt: new Date("2024-02-01T23:59:59Z"),
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: ObjectId(),
    alertId: "ALT-002",
    type: "license",
    severity: "error",
    title: "Driver License Expiring Soon",
    message: "Driver Robert Johnson (EMP001) license expires in 30 days",
    relatedEntity: {
      type: "driver",
      id: ObjectId(),
      reference: "EMP001"
    },
    isRead: false,
    isResolved: false,
    assignedTo: {
      id: ObjectId(),
      name: "Sarah Manager",
      email: "manager@fleet.com"
    },
    expiresAt: new Date("2024-12-31T23:59:59Z"),
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  }
]);

// =============================================
// CREATE INDEXES FOR PERFORMANCE
// =============================================

// Users indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "status": 1 });

// Drivers indexes
db.drivers.createIndex({ "employeeId": 1 }, { unique: true });
db.drivers.createIndex({ "email": 1 }, { unique: true });
db.drivers.createIndex({ "licenseNumber": 1 }, { unique: true });
db.drivers.createIndex({ "status": 1 });
db.drivers.createIndex({ "availability": 1 });

// Vehicles indexes
db.vehicles.createIndex({ "plateNumber": 1 }, { unique: true });
db.vehicles.createIndex({ "status": 1 });
db.vehicles.createIndex({ "currentDriver.id": 1 });

// Trips indexes
db.trips.createIndex({ "tripNumber": 1 }, { unique: true });
db.trips.createIndex({ "vehicle.id": 1 });
db.trips.createIndex({ "driver.id": 1 });
db.trips.createIndex({ "status": 1 });
db.trips.createIndex({ "scheduledStart": 1 });

// Fuel logs indexes
db.fuelLogs.createIndex({ "vehicle.id": 1 });
db.fuelLogs.createIndex({ "driver.id": 1 });
db.fuelLogs.createIndex({ "date": 1 });

// Maintenance records indexes
db.maintenanceRecords.createIndex({ "vehicle.id": 1 });
db.maintenanceRecords.createIndex({ "status": 1 });
db.maintenanceRecords.createIndex({ "scheduledDate": 1 });

// Requests indexes
db.requests.createIndex({ "requestNumber": 1 }, { unique: true });
db.requests.createIndex({ "user.id": 1 });
db.requests.createIndex({ "status": 1 });
db.requests.createIndex({ "type": 1 });

// Alerts indexes
db.alerts.createIndex({ "alertId": 1 }, { unique: true });
db.alerts.createIndex({ "type": 1 });
db.alerts.createIndex({ "severity": 1 });
db.alerts.createIndex({ "isRead": 1 });
db.alerts.createIndex({ "isResolved": 1 });

print("✅ Fleet Management System database seeded successfully!");
print("📊 Collections created: users, drivers, vehicles, trips, fuelLogs, maintenanceRecords, requests, alerts");
print("🔍 Indexes created for optimal performance");
print("🎯 Sample data inserted for testing and development");
