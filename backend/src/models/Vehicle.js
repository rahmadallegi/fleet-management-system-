import { sql } from '../database/db.js';

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  await sql.query`
    INSERT INTO Vehicles (
      PlateNumber, VIN, Make, Model, Year, Color, Type, Category,
      Engine, Transmission, FuelType, Capacity, Status, Availability,
      PurchaseInfo, Registration, Insurance, Odometer, GPSDevice,
      Documents, Images, Notes
    )
    VALUES (
      ${vehicleData.plateNumber}, ${vehicleData.vin}, ${vehicleData.make}, ${vehicleData.model},
      ${vehicleData.year}, ${vehicleData.color}, ${vehicleData.type}, ${vehicleData.category},
      ${JSON.stringify(vehicleData.engine || {})}, ${vehicleData.transmission}, ${vehicleData.fuelType},
      ${JSON.stringify(vehicleData.capacity || {})}, ${vehicleData.status}, ${vehicleData.availability},
      ${JSON.stringify(vehicleData.purchaseInfo || {})}, ${JSON.stringify(vehicleData.registration || {})},
      ${JSON.stringify(vehicleData.insurance || {})}, ${JSON.stringify(vehicleData.odometer || {})},
      ${JSON.stringify(vehicleData.gpsDevice || {})}, ${JSON.stringify(vehicleData.documents || {})},
      ${JSON.stringify(vehicleData.images || {})}, ${vehicleData.notes}
    )
  `;
};

// Get vehicle by ID
export const getVehicleById = async (id) => {
  const result = await sql.query`SELECT * FROM Vehicles WHERE Id = ${id}`;
  return result.recordset[0];
};

// Get all vehicles
export const getAllVehicles = async () => {
  const result = await sql.query`SELECT * FROM Vehicles`;
  return result.recordset;
};

// Update vehicle by ID
export const updateVehicle = async (id, updates) => {
  await sql.query`
    UPDATE Vehicles SET
      PlateNumber = ${updates.plateNumber},
      VIN = ${updates.vin},
      Make = ${updates.make},
      Model = ${updates.model},
      Year = ${updates.year},
      Color = ${updates.color},
      Type = ${updates.type},
      Category = ${updates.category},
      Engine = ${JSON.stringify(updates.engine || {})},
      Transmission = ${updates.transmission},
      FuelType = ${updates.fuelType},
      Capacity = ${JSON.stringify(updates.capacity || {})},
      Status = ${updates.status},
      Availability = ${updates.availability},
      PurchaseInfo = ${JSON.stringify(updates.purchaseInfo || {})},
      Registration = ${JSON.stringify(updates.registration || {})},
      Insurance = ${JSON.stringify(updates.insurance || {})},
      Odometer = ${JSON.stringify(updates.odometer || {})},
      GPSDevice = ${JSON.stringify(updates.gpsDevice || {})},
      Documents = ${JSON.stringify(updates.documents || {})},
      Images = ${JSON.stringify(updates.images || {})},
      Notes = ${updates.notes}
    WHERE Id = ${id}
  `;
};

// Delete vehicle by ID
export const deleteVehicle = async (id) => {
  await sql.query`DELETE FROM Vehicles WHERE Id = ${id}`;
};
