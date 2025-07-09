# Fleet Management System - Database Documentation

## 📋 Overview

This directory contains comprehensive database schemas, sample data, and setup scripts for the Fleet Management System. The system supports both SQL and MongoDB databases.

## 📁 File Structure

```
database/
├── sql/
│   ├── schema.sql              # Complete SQL schema
│   └── sample_data.sql         # SQL sample data
├── mongodb/
│   └── seed_data.js           # MongoDB seed script
├── setup.js                   # Node.js database setup
└── README.md                  # This documentation
```

## 🗄️ Database Schema

### Core Collections/Tables

#### 1. **Users** 👥
- **Purpose**: System users with role-based access
- **Roles**: admin, user, warehouse
- **Key Fields**: name, email, password, role, status

#### 2. **Drivers** 🚗
- **Purpose**: Professional drivers in the fleet
- **Key Fields**: employeeId, firstName, lastName, licenseNumber, status, availability

#### 3. **Vehicles** 🚙
- **Purpose**: Fleet vehicles and their details
- **Key Fields**: plateNumber, make, model, year, status, mileage, currentDriver

#### 4. **Trips** 🛣️
- **Purpose**: Trip records and scheduling
- **Key Fields**: tripNumber, vehicle, driver, startLocation, endLocation, status

#### 5. **Fuel Logs** ⛽
- **Purpose**: Fuel consumption tracking
- **Key Fields**: vehicle, driver, date, quantity, cost, efficiency

#### 6. **Maintenance Records** 🔧
- **Purpose**: Vehicle maintenance tracking
- **Key Fields**: vehicle, type, category, scheduledDate, status, cost

#### 7. **Requests** 📝
- **Purpose**: User requests for vehicles/equipment
- **Key Fields**: requestNumber, user, type, status, priority

#### 8. **Alerts** 🚨
- **Purpose**: System notifications and alerts
- **Key Fields**: alertId, type, severity, message, isRead, isResolved

## 🚀 Quick Setup

### MongoDB Setup (Recommended)

1. **Install MongoDB** (if not already installed)
2. **Run the setup script**:
   ```bash
   cd database
   node setup.js
   ```

3. **Or use MongoDB shell**:
   ```bash
   mongosh < mongodb/seed_data.js
   ```

### SQL Setup (Alternative)

1. **Create database**:
   ```sql
   CREATE DATABASE fleet_management;
   USE fleet_management;
   ```

2. **Run schema**:
   ```bash
   mysql -u username -p fleet_management < sql/schema.sql
   ```

3. **Insert sample data**:
   ```bash
   mysql -u username -p fleet_management < sql/sample_data.sql
   ```

## 📊 Sample Data Overview

### Users (5 records)
- **Admin**: admin@fleet.com / admin123
- **User**: user@fleet.com / user123  
- **Warehouse**: warehouse@fleet.com / warehouse123

### Drivers (5 records)
- Professional drivers with licenses and contact info
- Various availability states (available, on-duty, off-duty)

### Vehicles (5 records)
- Mixed fleet: Toyota Camry, Honda Accord, Ford Transit, etc.
- Different statuses: active, maintenance, out-of-service

### Trips (8 records)
- Various trip types: client meetings, airport pickups, team transport
- Different statuses: scheduled, in-progress, completed

### Fuel Logs (8 records)
- Realistic fuel consumption data
- Different fuel types: gasoline, diesel, electric

### Maintenance Records (8 records)
- Scheduled and emergency maintenance
- Various categories: oil-change, brakes, tires, engine

## 🔍 Database Indexes

### Performance Optimizations

#### MongoDB Indexes:
```javascript
// Users
{ "email": 1 } (unique)
{ "role": 1 }
{ "status": 1 }

// Drivers  
{ "employeeId": 1 } (unique)
{ "email": 1 } (unique)
{ "licenseNumber": 1 } (unique)

// Vehicles
{ "plateNumber": 1 } (unique)
{ "status": 1 }

// Trips
{ "tripNumber": 1 } (unique)
{ "status": 1 }
{ "scheduledStart": 1 }
```

#### SQL Indexes:
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Vehicles  
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Trips
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_date ON trips(scheduled_start);
```

## 🛠️ Environment Configuration

### MongoDB Connection
```javascript
// Default connection
const MONGODB_URI = 'mongodb://localhost:27017/fleet_management';

// With authentication
const MONGODB_URI = 'mongodb://username:password@localhost:27017/fleet_management';

// MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/fleet_management';
```

### SQL Connection
```javascript
// MySQL
const DB_CONFIG = {
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'fleet_management'
};

// PostgreSQL
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'username',
  password: 'password',
  database: 'fleet_management'
};
```

## 📈 Data Relationships

### Key Relationships:
- **Users** → **Requests** (one-to-many)
- **Drivers** → **Vehicles** (one-to-one current assignment)
- **Vehicles** → **Trips** (one-to-many)
- **Vehicles** → **Fuel Logs** (one-to-many)
- **Vehicles** → **Maintenance Records** (one-to-many)
- **Drivers** → **Trips** (one-to-many)

### MongoDB Document Structure:
```javascript
// Embedded documents for related data
{
  vehicle: {
    id: ObjectId,
    plateNumber: "ABC-123",
    make: "Toyota",
    model: "Camry"
  },
  driver: {
    id: ObjectId,
    firstName: "John",
    lastName: "Doe",
    employeeId: "EMP001"
  }
}
```

## 🔒 Security Considerations

### Data Protection:
- **Passwords**: Hashed with bcrypt
- **Sensitive Data**: Encrypted at rest
- **Access Control**: Role-based permissions
- **Audit Trail**: Created/updated timestamps

### Best Practices:
- Use environment variables for credentials
- Implement connection pooling
- Regular database backups
- Monitor query performance

## 🧪 Testing Data

### Test Scenarios Covered:
- ✅ **User Authentication** - Multiple roles
- ✅ **Vehicle Management** - Various statuses
- ✅ **Trip Planning** - Different trip types
- ✅ **Maintenance Tracking** - Scheduled/emergency
- ✅ **Fuel Monitoring** - Multiple fuel types
- ✅ **Request Management** - Various request types
- ✅ **Alert System** - Different severity levels

### Data Validation:
- Email format validation
- Phone number formats
- Date range validations
- Enum value constraints
- Required field enforcement

## 📚 Additional Resources

### MongoDB Resources:
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

### SQL Resources:
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize ORM](https://sequelize.org/)

## 🎯 Next Steps

1. **Choose Database**: MongoDB (recommended) or SQL
2. **Run Setup Script**: Use provided setup scripts
3. **Configure Environment**: Set connection strings
4. **Test Connection**: Verify database connectivity
5. **Start Development**: Begin building your application

---

**Note**: This database schema is production-ready and follows industry best practices for fleet management systems. Adjust as needed for your specific requirements.
