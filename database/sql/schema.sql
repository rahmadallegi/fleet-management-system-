-- Fleet Management System - SQL Server Schema
-- Database: fleet_management

-- USERS TABLE
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) CHECK (role IN ('admin', 'user', 'warehouse')) DEFAULT 'user',
    status NVARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    last_login DATETIME2 NULL
);

-- DRIVERS TABLE
CREATE TABLE drivers (
    id INT PRIMARY KEY IDENTITY(1,1),
    employee_id NVARCHAR(20) UNIQUE NOT NULL,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    phone NVARCHAR(20),
    license_number NVARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    date_of_birth DATE,
    hire_date DATE NOT NULL,
    status NVARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    availability NVARCHAR(20) CHECK (availability IN ('available', 'on-duty', 'off-duty')) DEFAULT 'available',
    address NVARCHAR(MAX),
    emergency_contact_name NVARCHAR(100),
    emergency_contact_phone NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- VEHICLES TABLE
CREATE TABLE vehicles (
    id INT PRIMARY KEY IDENTITY(1,1),
    plate_number NVARCHAR(20) UNIQUE NOT NULL,
    make NVARCHAR(50) NOT NULL,
    model NVARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color NVARCHAR(30),
    vin NVARCHAR(50) UNIQUE,
    fuel_type NVARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')) DEFAULT 'gasoline',
    capacity INT,
    mileage DECIMAL(10,2) DEFAULT 0,
    status NVARCHAR(20) CHECK (status IN ('active', 'maintenance', 'out-of-service', 'retired')) DEFAULT 'active',
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    insurance_policy NVARCHAR(100),
    insurance_expiry DATE,
    registration_expiry DATE,
    current_driver_id INT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (current_driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

-- TRIPS TABLE
CREATE TABLE trips (
    id INT PRIMARY KEY IDENTITY(1,1),
    trip_number NVARCHAR(20) UNIQUE NOT NULL,
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    start_location NVARCHAR(255) NOT NULL,
    end_location NVARCHAR(255) NOT NULL,
    start_time DATETIME2 NULL,
    end_time DATETIME2 NULL,
    scheduled_start DATETIME2 NOT NULL,
    scheduled_end DATETIME2 NOT NULL,
    distance DECIMAL(8,2),
    purpose NVARCHAR(MAX),
    status NVARCHAR(20) CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    passenger_count INT DEFAULT 0,
    notes NVARCHAR(MAX),
    created_by INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- FUEL LOGS TABLE
CREATE TABLE fuel_logs (
    id INT PRIMARY KEY IDENTITY(1,1),
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    date DATE NOT NULL,
    odometer DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    fuel_type NVARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric')) NOT NULL,
    station NVARCHAR(100),
    receipt_number NVARCHAR(50),
    efficiency DECIMAL(6,2),
    notes NVARCHAR(MAX),
    created_by INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- MAINTENANCE RECORDS TABLE
CREATE TABLE maintenance_records (
    id INT PRIMARY KEY IDENTITY(1,1),
    vehicle_id INT NOT NULL,
    type NVARCHAR(20) CHECK (type IN ('scheduled', 'emergency', 'inspection', 'repair')) NOT NULL,
    category NVARCHAR(20) CHECK (category IN ('oil-change', 'brakes', 'tires', 'engine', 'transmission', 'electrical', 'other')) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    scheduled_date DATE NOT NULL,
    completed_date DATE NULL,
    status NVARCHAR(20) CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
    priority NVARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    service_provider NVARCHAR(100),
    technician NVARCHAR(100),
    parts_used NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    created_by INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- REQUESTS TABLE
CREATE TABLE requests (
    id INT PRIMARY KEY IDENTITY(1,1),
    request_number NVARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    type NVARCHAR(20) CHECK (type IN ('vehicle', 'equipment', 'maintenance')) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    priority NVARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status NVARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
    requested_date DATE NOT NULL,
    required_date DATE,
    approved_by INT NULL,
    approved_at DATETIME2 NULL,
    completed_at DATETIME2 NULL,
    rejection_reason NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ALERTS TABLE
CREATE TABLE alerts (
    id INT PRIMARY KEY IDENTITY(1,1),
    alert_id NVARCHAR(20) UNIQUE NOT NULL,
    type NVARCHAR(20) CHECK (type IN ('maintenance', 'fuel', 'license', 'insurance', 'registration', 'other')) NOT NULL,
    severity NVARCHAR(20) CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    related_entity_type NVARCHAR(20) CHECK (related_entity_type IN ('vehicle', 'driver', 'trip', 'maintenance')) NULL,
    related_entity_id INT NULL,
    is_read BIT DEFAULT 0,
    is_resolved BIT DEFAULT 0,
    assigned_to INT NULL,
    expires_at DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
