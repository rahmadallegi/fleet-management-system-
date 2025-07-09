-- Fleet Management System - Sample Data
-- Insert comprehensive sample data for testing and development

-- =============================================
-- USERS DATA
-- =============================================
INSERT INTO users (name, email, password, role, status, phone, address) VALUES
('John Admin', 'admin@fleet.com', '$2b$10$hashedpassword1', 'admin', 'active', '+1-555-0101', '123 Admin St, City, State 12345'),
('Sarah Manager', 'manager@fleet.com', '$2b$10$hashedpassword2', 'admin', 'active', '+1-555-0102', '456 Manager Ave, City, State 12346'),
('Mike User', 'user@fleet.com', '$2b$10$hashedpassword3', 'user', 'active', '+1-555-0103', '789 User Blvd, City, State 12347'),
('Lisa Warehouse', 'warehouse@fleet.com', '$2b$10$hashedpassword4', 'warehouse', 'active', '+1-555-0104', '321 Warehouse Dr, City, State 12348'),
('Tom Employee', 'tom@fleet.com', '$2b$10$hashedpassword5', 'user', 'active', '+1-555-0105', '654 Employee Ln, City, State 12349'),
('Anna Staff', 'anna@fleet.com', '$2b$10$hashedpassword6', 'user', 'active', '+1-555-0106', '987 Staff Rd, City, State 12350'),
('David Operator', 'david@fleet.com', '$2b$10$hashedpassword7', 'warehouse', 'active', '+1-555-0107', '147 Operator St, City, State 12351'),
('Emma Coordinator', 'emma@fleet.com', '$2b$10$hashedpassword8', 'user', 'inactive', '+1-555-0108', '258 Coordinator Ave, City, State 12352');

-- =============================================
-- DRIVERS DATA
-- =============================================
INSERT INTO drivers (employee_id, first_name, last_name, email, phone, license_number, license_expiry, date_of_birth, hire_date, status, availability, address, emergency_contact_name, emergency_contact_phone) VALUES
('EMP001', 'Robert', 'Johnson', 'robert.johnson@fleet.com', '+1-555-1001', 'DL123456789', '2025-12-31', '1985-03-15', '2020-01-15', 'active', 'available', '111 Driver St, City, State 12345', 'Mary Johnson', '+1-555-1101'),
('EMP002', 'Jennifer', 'Williams', 'jennifer.williams@fleet.com', '+1-555-1002', 'DL987654321', '2026-06-30', '1990-07-22', '2021-03-10', 'active', 'on-duty', '222 Driver Ave, City, State 12346', 'James Williams', '+1-555-1102'),
('EMP003', 'Michael', 'Brown', 'michael.brown@fleet.com', '+1-555-1003', 'DL456789123', '2025-09-15', '1988-11-08', '2019-08-20', 'active', 'available', '333 Driver Blvd, City, State 12347', 'Susan Brown', '+1-555-1103'),
('EMP004', 'Sarah', 'Davis', 'sarah.davis@fleet.com', '+1-555-1004', 'DL789123456', '2026-03-20', '1992-05-12', '2022-01-05', 'active', 'off-duty', '444 Driver Dr, City, State 12348', 'John Davis', '+1-555-1104'),
('EMP005', 'Christopher', 'Miller', 'chris.miller@fleet.com', '+1-555-1005', 'DL321654987', '2025-11-10', '1987-09-30', '2020-06-15', 'active', 'available', '555 Driver Ln, City, State 12349', 'Lisa Miller', '+1-555-1105'),
('EMP006', 'Amanda', 'Wilson', 'amanda.wilson@fleet.com', '+1-555-1006', 'DL654987321', '2026-01-25', '1991-12-03', '2021-09-12', 'inactive', 'off-duty', '666 Driver Rd, City, State 12350', 'Mark Wilson', '+1-555-1106'),
('EMP007', 'Daniel', 'Moore', 'daniel.moore@fleet.com', '+1-555-1007', 'DL147258369', '2025-08-18', '1989-04-17', '2020-11-08', 'active', 'available', '777 Driver Way, City, State 12351', 'Rachel Moore', '+1-555-1107'),
('EMP008', 'Jessica', 'Taylor', 'jessica.taylor@fleet.com', '+1-555-1008', 'DL369258147', '2026-05-12', '1993-01-28', '2022-04-20', 'active', 'on-duty', '888 Driver Ct, City, State 12352', 'Kevin Taylor', '+1-555-1108');

-- =============================================
-- VEHICLES DATA
-- =============================================
INSERT INTO vehicles (plate_number, make, model, year, color, vin, fuel_type, capacity, mileage, status, purchase_date, purchase_price, insurance_policy, insurance_expiry, registration_expiry, current_driver_id) VALUES
('ABC-123', 'Toyota', 'Camry', 2022, 'White', '1HGBH41JXMN109186', 'gasoline', 5, 15420.50, 'active', '2022-01-15', 28500.00, 'POL-2022-001', '2024-12-31', '2024-12-31', 1),
('XYZ-789', 'Honda', 'Accord', 2021, 'Silver', '2HGBH41JXMN109187', 'gasoline', 5, 22150.75, 'active', '2021-06-20', 26800.00, 'POL-2021-002', '2024-12-31', '2024-12-31', 2),
('DEF-456', 'Ford', 'Transit', 2023, 'Blue', '3HGBH41JXMN109188', 'diesel', 12, 8750.25, 'active', '2023-03-10', 45200.00, 'POL-2023-003', '2024-12-31', '2024-12-31', 3),
('GHI-321', 'Chevrolet', 'Malibu', 2022, 'Black', '4HGBH41JXMN109189', 'gasoline', 5, 18900.00, 'maintenance', '2022-08-05', 27300.00, 'POL-2022-004', '2024-12-31', '2024-12-31', NULL),
('JKL-654', 'Nissan', 'Altima', 2021, 'Red', '5HGBH41JXMN109190', 'gasoline', 5, 31200.80, 'active', '2021-11-12', 25900.00, 'POL-2021-005', '2024-12-31', '2024-12-31', 4),
('MNO-987', 'Hyundai', 'Elantra', 2023, 'Gray', '6HGBH41JXMN109191', 'gasoline', 5, 5420.30, 'active', '2023-05-18', 24500.00, 'POL-2023-006', '2024-12-31', '2024-12-31', 5),
('PQR-147', 'Kia', 'Optima', 2022, 'White', '7HGBH41JXMN109192', 'gasoline', 5, 12800.45, 'out-of-service', '2022-02-28', 26100.00, 'POL-2022-007', '2024-12-31', '2024-12-31', NULL),
('STU-258', 'Mazda', 'CX-5', 2023, 'Blue', '8HGBH41JXMN109193', 'gasoline', 5, 7650.90, 'active', '2023-07-22', 32800.00, 'POL-2023-008', '2024-12-31', '2024-12-31', 7),
('VWX-369', 'Subaru', 'Outback', 2022, 'Green', '9HGBH41JXMN109194', 'gasoline', 5, 19750.60, 'active', '2022-09-14', 34200.00, 'POL-2022-009', '2024-12-31', '2024-12-31', 8),
('YZA-741', 'Tesla', 'Model 3', 2023, 'Black', 'AHGBH41JXMN109195', 'electric', 5, 12300.00, 'active', '2023-04-08', 48900.00, 'POL-2023-010', '2024-12-31', '2024-12-31', NULL);

-- =============================================
-- TRIPS DATA
-- =============================================
INSERT INTO trips (trip_number, vehicle_id, driver_id, start_location, end_location, start_time, end_time, scheduled_start, scheduled_end, distance, purpose, status, passenger_count, notes, created_by) VALUES
('TRP-001', 1, 1, 'Main Office', 'Downtown Branch', '2024-01-15 09:00:00', '2024-01-15 10:30:00', '2024-01-15 09:00:00', '2024-01-15 10:30:00', 25.5, 'Client Meeting', 'completed', 3, 'Successful client presentation', 1),
('TRP-002', 2, 2, 'Warehouse', 'Airport', '2024-01-15 14:00:00', NULL, '2024-01-15 14:00:00', '2024-01-15 16:00:00', 45.2, 'Airport Pickup', 'in-progress', 1, 'VIP client pickup', 1),
('TRP-003', 3, 3, 'Head Office', 'Regional Office', '2024-01-16 08:00:00', '2024-01-16 12:00:00', '2024-01-16 08:00:00', '2024-01-16 12:00:00', 120.8, 'Team Transport', 'completed', 8, 'Monthly team meeting', 2),
('TRP-004', 5, 4, 'City Center', 'Suburban Office', NULL, NULL, '2024-01-17 10:00:00', '2024-01-17 11:30:00', 35.0, 'Document Delivery', 'scheduled', 1, 'Important contracts', 3),
('TRP-005', 6, 5, 'Training Center', 'Main Office', '2024-01-16 15:30:00', '2024-01-16 16:45:00', '2024-01-16 15:30:00', '2024-01-16 16:45:00', 18.7, 'Training Session', 'completed', 5, 'Safety training completed', 1),
('TRP-006', 8, 7, 'Hotel', 'Conference Center', NULL, NULL, '2024-01-18 09:30:00', '2024-01-18 17:00:00', 28.3, 'Conference Transport', 'scheduled', 4, 'All-day conference', 2),
('TRP-007', 9, 8, 'Office', 'Client Site', '2024-01-15 11:00:00', NULL, '2024-01-15 11:00:00', '2024-01-15 15:00:00', 52.1, 'Site Visit', 'in-progress', 2, 'Technical assessment', 3),
('TRP-008', 1, 1, 'Branch Office', 'Main Office', NULL, NULL, '2024-01-19 16:00:00', '2024-01-19 17:30:00', 25.5, 'Return Trip', 'scheduled', 2, 'End of day return', 1);

-- =============================================
-- FUEL LOGS DATA
-- =============================================
INSERT INTO fuel_logs (vehicle_id, driver_id, date, odometer, quantity, cost, fuel_type, station, receipt_number, efficiency, notes, created_by) VALUES
(1, 1, '2024-01-10', 15400.50, 45.2, 67.80, 'gasoline', 'Shell Station Downtown', 'RCP-001-2024', 8.5, 'Regular fill-up', 1),
(2, 2, '2024-01-12', 22100.75, 48.7, 73.05, 'gasoline', 'BP Gas Station', 'RCP-002-2024', 7.8, 'Full tank', 2),
(3, 3, '2024-01-08', 8720.25, 65.3, 98.45, 'diesel', 'Diesel Depot', 'RCP-003-2024', 6.2, 'Long trip preparation', 3),
(5, 4, '2024-01-14', 31180.80, 42.1, 63.15, 'gasoline', 'Exxon Station', 'RCP-004-2024', 9.1, 'Efficient driving', 1),
(6, 5, '2024-01-11', 5400.30, 38.9, 58.35, 'gasoline', 'Chevron Station', 'RCP-005-2024', 8.7, 'City driving', 2),
(8, 7, '2024-01-13', 7630.90, 41.5, 62.25, 'gasoline', 'Mobil Station', 'RCP-006-2024', 8.9, 'Highway driving', 3),
(9, 8, '2024-01-09', 19720.60, 44.8, 67.20, 'gasoline', 'Shell Station Uptown', 'RCP-007-2024', 8.3, 'Mixed driving', 1),
(10, NULL, '2024-01-15', 12280.00, 0.0, 15.50, 'electric', 'Tesla Supercharger', 'RCP-008-2024', 0.0, 'Electric charging - 45 minutes', 2);

-- =============================================
-- MAINTENANCE RECORDS DATA
-- =============================================
INSERT INTO maintenance_records (vehicle_id, type, category, title, description, scheduled_date, completed_date, status, priority, estimated_cost, actual_cost, service_provider, technician, parts_used, notes, created_by) VALUES
(1, 'scheduled', 'oil-change', 'Regular Oil Change', '5000km service - oil and filter change', '2024-01-20', NULL, 'pending', 'medium', 85.00, NULL, 'Quick Lube Center', 'Mike Johnson', 'Oil filter, 5L synthetic oil', 'Due for regular maintenance', 1),
(4, 'emergency', 'brakes', 'Brake Pad Replacement', 'Front brake pads worn out, squeaking noise', '2024-01-16', '2024-01-16', 'completed', 'high', 250.00, 275.50, 'Auto Service Pro', 'Sarah Wilson', 'Front brake pads, brake fluid', 'Emergency repair completed successfully', 2),
(3, 'scheduled', 'tires', 'Tire Rotation and Balance', 'Regular tire maintenance', '2024-01-25', NULL, 'pending', 'low', 120.00, NULL, 'Tire Express', 'Tom Anderson', 'Wheel weights', 'Scheduled maintenance', 1),
(7, 'inspection', 'other', 'Annual Safety Inspection', 'Mandatory annual vehicle inspection', '2024-01-30', NULL, 'pending', 'medium', 75.00, NULL, 'State Inspection Center', 'Official Inspector', 'Inspection certificate', 'Required by law', 3),
(2, 'repair', 'engine', 'Check Engine Light', 'Diagnostic and repair for check engine light', '2024-01-18', NULL, 'in-progress', 'high', 300.00, NULL, 'Engine Specialists', 'Dave Martinez', 'TBD after diagnosis', 'Diagnostic in progress', 2),
(6, 'scheduled', 'oil-change', 'Oil Change Service', 'Regular maintenance - 3000km service', '2024-01-22', NULL, 'pending', 'medium', 80.00, NULL, 'Quick Lube Center', 'Mike Johnson', 'Oil filter, 4.5L conventional oil', 'New vehicle first service', 1),
(9, 'scheduled', 'electrical', 'Battery Check', 'Battery performance test and maintenance', '2024-01-28', NULL, 'pending', 'low', 50.00, NULL, 'Battery World', 'Lisa Chen', 'Battery terminals cleaning', 'Preventive maintenance', 3),
(5, 'repair', 'transmission', 'Transmission Service', 'Transmission fluid change and inspection', '2024-01-24', NULL, 'pending', 'medium', 180.00, NULL, 'Transmission Experts', 'Robert Kim', 'Transmission fluid, filter', 'High mileage vehicle', 2);

-- =============================================
-- REQUESTS DATA
-- =============================================
INSERT INTO requests (request_number, user_id, type, title, description, priority, status, requested_date, required_date, approved_by, approved_at, completed_at, rejection_reason, notes, created_by) VALUES
('REQ-001', 3, 'vehicle', 'Vehicle for Client Meeting', 'Need a vehicle for important client presentation downtown', 'high', 'approved', '2024-01-15', '2024-01-17', 1, '2024-01-15 10:30:00', NULL, NULL, 'Approved for ABC-123', 3),
('REQ-002', 5, 'equipment', 'Laptop for Field Work', 'Request for portable laptop for field data collection', 'medium', 'pending', '2024-01-16', '2024-01-20', NULL, NULL, NULL, NULL, 'Waiting for IT approval', 5),
('REQ-003', 6, 'maintenance', 'AC Repair Request', 'Office air conditioning not working properly', 'high', 'in-progress', '2024-01-14', '2024-01-16', 2, '2024-01-14 14:20:00', NULL, NULL, 'Technician assigned', 6),
('REQ-004', 3, 'vehicle', 'Airport Pickup Service', 'Vehicle needed for VIP client airport pickup', 'urgent', 'approved', '2024-01-15', '2024-01-15', 1, '2024-01-15 08:45:00', '2024-01-15 16:00:00', NULL, 'Completed successfully', 3),
('REQ-005', 8, 'equipment', 'Projector for Training', 'Need projector for employee training session', 'low', 'rejected', '2024-01-12', '2024-01-18', 2, '2024-01-13 09:15:00', NULL, 'Equipment already available in training room', 'Alternative solution provided', 8),
('REQ-006', 5, 'vehicle', 'Delivery Van Request', 'Large van needed for equipment delivery', 'medium', 'approved', '2024-01-16', '2024-01-19', 1, '2024-01-16 11:00:00', NULL, NULL, 'DEF-456 assigned', 5),
('REQ-007', 6, 'maintenance', 'Printer Maintenance', 'Office printer needs servicing', 'low', 'pending', '2024-01-17', '2024-01-25', NULL, NULL, NULL, NULL, 'Scheduled for next week', 6),
('REQ-008', 3, 'equipment', 'Mobile Hotspot', 'Internet connectivity for remote work', 'medium', 'approved', '2024-01-16', '2024-01-18', 2, '2024-01-16 15:30:00', NULL, NULL, 'IT department processing', 3);

-- =============================================
-- ALERTS DATA
-- =============================================
INSERT INTO alerts (alert_id, type, severity, title, message, related_entity_type, related_entity_id, is_read, is_resolved, assigned_to, expires_at) VALUES
('ALT-001', 'maintenance', 'warning', 'Vehicle ABC-123 Due for Service', 'Vehicle ABC-123 has reached 15,000km and is due for scheduled maintenance', 'vehicle', 1, FALSE, FALSE, 1, '2024-02-01 23:59:59'),
('ALT-002', 'license', 'error', 'Driver License Expiring Soon', 'Driver Robert Johnson (EMP001) license expires in 30 days', 'driver', 1, FALSE, FALSE, 2, '2024-12-31 23:59:59'),
('ALT-003', 'fuel', 'info', 'Fuel Efficiency Alert', 'Vehicle XYZ-789 showing decreased fuel efficiency', 'vehicle', 2, TRUE, FALSE, 1, NULL),
('ALT-004', 'insurance', 'critical', 'Insurance Renewal Required', 'Vehicle insurance for GHI-321 expires in 15 days', 'vehicle', 4, FALSE, FALSE, 1, '2024-12-31 23:59:59'),
('ALT-005', 'maintenance', 'error', 'Emergency Repair Needed', 'Vehicle GHI-321 reported brake issues - immediate attention required', 'vehicle', 4, FALSE, TRUE, 2, NULL),
('ALT-006', 'registration', 'warning', 'Registration Renewal Due', 'Vehicle registration for multiple vehicles expiring this month', NULL, NULL, FALSE, FALSE, 1, '2024-12-31 23:59:59'),
('ALT-007', 'other', 'info', 'Monthly Report Available', 'Fleet utilization report for December 2023 is ready for review', NULL, NULL, TRUE, TRUE, 1, NULL),
('ALT-008', 'fuel', 'warning', 'High Fuel Consumption', 'Vehicle DEF-456 showing higher than normal fuel consumption', 'vehicle', 3, FALSE, FALSE, 4, NULL);
