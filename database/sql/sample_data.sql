-- Fleet Management System - Sample Data for SQL Server
-- Database: fleet_management

-- ============================
-- USERS
-- ============================
INSERT INTO users (name, email, password, role, status, phone, address, last_login)
VALUES 
('Admin User', 'admin@example.com', 'hashedpassword123', 'admin', 'active', '1234567890', 'HQ Building, City', GETDATE()),
('John Doe', 'john.doe@example.com', 'hashedpassword456', 'user', 'active', '9876543210', '123 Main Street', NULL),
('Jane Smith', 'jane.smith@example.com', 'hashedpassword789', 'warehouse', 'inactive', '555666777', 'Warehouse Zone', NULL);

-- ============================
-- DRIVERS
-- ============================
INSERT INTO drivers (employee_id, first_name, last_name, email, phone, license_number, license_expiry, date_of_birth, hire_date, status, availability, address, emergency_contact_name, emergency_contact_phone)
VALUES
('DRV001', 'Michael', 'Brown', 'michael.brown@example.com', '222333444', 'LIC12345', '2026-12-31', '1985-05-20', '2020-01-15', 'active', 'available', '45 Oak Street', 'Alice Brown', '333444555'),
('DRV002', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '333444555', 'LIC54321', '2025-11-30', '1990-08-10', '2021-03-01', 'active', 'on-duty', '88 Pine Avenue', 'David Johnson', '444555666');

-- ============================
-- VEHICLES
-- ============================
INSERT INTO vehicles (plate_number, make, model, year, color, vin, fuel_type, capacity, mileage, status, purchase_date, purchase_price, insurance_policy, insurance_expiry, registration_expiry, current_driver_id)
VALUES
('ABC123', 'Toyota', 'Corolla', 2020, 'White', 'VIN0001TOYCOR', 'gasoline', 5, 35000.50, 'active', '2020-02-10', 20000, 'POL123', '2025-12-31', '2024-12-31', 1),
('XYZ789', 'Ford', 'Transit', 2019, 'Blue', 'VIN0002FORDTRA', 'diesel', 12, 75000.00, 'maintenance', '2019-06-20', 35000, 'POL456', '2024-11-30', '2023-11-30', 2);

-- ============================
-- TRIPS
-- ============================
INSERT INTO trips (trip_number, vehicle_id, driver_id, start_location, end_location, scheduled_start, scheduled_end, distance, purpose, status, passenger_count, notes, created_by)
VALUES
('TRIP001', 1, 1, 'City A', 'City B', '2023-08-01 08:00:00', '2023-08-01 12:00:00', 250.50, 'Delivery', 'completed', 0, 'No issues', 1),
('TRIP002', 2, 2, 'Warehouse', 'Factory', '2023-08-05 09:00:00', '2023-08-05 11:30:00', 120.00, 'Supplies', 'in-progress', 2, 'Urgent delivery', 2);

-- ============================
-- FUEL LOGS
-- ============================
INSERT INTO fuel_logs (vehicle_id, driver_id, date, odometer, quantity, cost, fuel_type, station, receipt_number, efficiency, notes, created_by)
VALUES
(1, 1, '2023-07-20', 34000.50, 40.00, 60.00, 'gasoline', 'Fuel Station A', 'R001', 15.5, 'Regular refuel', 1),
(2, 2, '2023-07-25', 74000.00, 60.00, 100.00, 'diesel', 'Fuel Station B', 'R002', 12.3, 'Before trip', 2);

-- ============================
-- MAINTENANCE RECORDS
-- ============================
INSERT INTO maintenance_records (vehicle_id, type, category, title, description, scheduled_date, completed_date, status, priority, estimated_cost, actual_cost, service_provider, technician, parts_used, notes, created_by)
VALUES
(2, 'scheduled', 'oil-change', 'Oil Change', 'Routine oil change for Transit van', '2023-08-15', NULL, 'pending', 'medium', 80.00, NULL, 'AutoFix Shop', 'Mike T.', 'Oil filter', 'Next due in 5,000 km', 1),
(1, 'repair', 'brakes', 'Brake Pad Replacement', 'Front brake pads worn out', '2023-07-10', '2023-07-12', 'completed', 'high', 200.00, 220.00, 'BrakeMasters', 'Anna K.', 'Brake pads set', 'Replaced successfully', 2);

-- ============================
-- REQUESTS
-- ============================
INSERT INTO requests (request_number, user_id, type, title, description, priority, status, requested_date, required_date, approved_by, approved_at, completed_at, notes)
VALUES
('REQ001', 2, 'vehicle', 'New Van Request', 'Request for additional delivery van', 'high', 'pending', '2023-08-01', '2023-09-01', NULL, NULL, NULL, 'Urgent need for warehouse operations'),
('REQ002', 3, 'maintenance', 'Repair Request', 'Broken AC in warehouse', 'medium', 'approved', '2023-07-20', '2023-07-25', 1, '2023-07-21', NULL, 'Approved by admin');

-- ============================
-- ALERTS
-- ============================
INSERT INTO alerts (alert_id, type, severity, title, message, related_entity_type, related_entity_id, is_read, is_resolved, assigned_to, expires_at)
VALUES
('ALERT001', 'maintenance', 'warning', 'Upcoming Oil Change', 'Oil change due for Ford Transit', 'vehicle', 2, 0, 0, 1, '2023-08-15'),
('ALERT002', 'fuel', 'info', 'Low Fuel Warning', 'Vehicle Toyota Corolla running low on fuel', 'vehicle', 1, 1, 0, 2, '2023-08-05');
