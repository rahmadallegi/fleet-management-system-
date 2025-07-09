// Professional Data Export Utilities

export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // If columns not specified, use all keys from first object
  const headers = columns || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        const cellValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value).replace(/"/g, '""')
          : String(value || '').replace(/"/g, '""');
        // Wrap in quotes if contains comma, newline, or quote
        return /[,\n"]/.test(cellValue) ? `"${cellValue}"` : cellValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = (data, filename = 'export.json') => {
  if (!data) {
    throw new Error('No data to export');
  }

  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  // This would require a library like xlsx or exceljs
  // For now, we'll export as CSV with .xlsx extension
  console.warn('Excel export not fully implemented. Exporting as CSV instead.');
  exportToCSV(data, filename.replace('.xlsx', '.csv'));
};

export const exportToPDF = async (elementId, filename = 'export.pdf') => {
  // This would require a library like jsPDF or html2pdf
  console.warn('PDF export requires additional library. Please implement with jsPDF or html2pdf.');
  throw new Error('PDF export not implemented');
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

// Specialized export functions for fleet management data

export const exportVehicles = (vehicles) => {
  const processedData = vehicles.map(vehicle => ({
    'Plate Number': vehicle.plateNumber,
    'Make': vehicle.make,
    'Model': vehicle.model,
    'Year': vehicle.year,
    'Status': vehicle.status,
    'Mileage': vehicle.mileage,
    'Fuel Type': vehicle.fuelType,
    'Last Maintenance': vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString() : 'N/A',
    'Driver': vehicle.currentDriver || 'Unassigned'
  }));

  exportToCSV(processedData, `vehicles_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportDrivers = (drivers) => {
  const processedData = drivers.map(driver => ({
    'Employee ID': driver.employeeId,
    'First Name': driver.firstName,
    'Last Name': driver.lastName,
    'Email': driver.email,
    'Phone': driver.phone || 'N/A',
    'Status': driver.status,
    'Availability': driver.availability,
    'License Number': driver.licenseNumber || 'N/A',
    'Hire Date': driver.hireDate ? new Date(driver.hireDate).toLocaleDateString() : 'N/A'
  }));

  exportToCSV(processedData, `drivers_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportTrips = (trips) => {
  const processedData = trips.map(trip => ({
    'Trip ID': trip._id,
    'Vehicle': trip.vehicle?.plateNumber || 'N/A',
    'Driver': trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'N/A',
    'Start Location': trip.startLocation,
    'End Location': trip.endLocation,
    'Start Time': trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A',
    'End Time': trip.endTime ? new Date(trip.endTime).toLocaleString() : 'N/A',
    'Distance (km)': trip.distance || 'N/A',
    'Status': trip.status,
    'Purpose': trip.purpose || 'N/A'
  }));

  exportToCSV(processedData, `trips_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportFuelLogs = (fuelLogs) => {
  const processedData = fuelLogs.map(log => ({
    'Date': log.date ? new Date(log.date).toLocaleDateString() : 'N/A',
    'Vehicle': log.vehicle?.plateNumber || 'N/A',
    'Driver': log.driver ? `${log.driver.firstName} ${log.driver.lastName}` : 'N/A',
    'Fuel Type': log.fuelType,
    'Quantity (L)': log.quantity,
    'Cost': `$${log.cost}`,
    'Odometer': log.odometer,
    'Station': log.station || 'N/A',
    'Efficiency (L/100km)': log.efficiency || 'N/A'
  }));

  exportToCSV(processedData, `fuel_logs_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportMaintenanceRecords = (records) => {
  const processedData = records.map(record => ({
    'Date': record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : 'N/A',
    'Vehicle': record.vehicle?.plateNumber || 'N/A',
    'Type': record.type,
    'Category': record.category,
    'Title': record.title,
    'Description': record.description || 'N/A',
    'Priority': record.priority,
    'Status': record.status,
    'Estimated Cost': record.estimatedCost ? `$${record.estimatedCost}` : 'N/A',
    'Actual Cost': record.actualCost ? `$${record.actualCost}` : 'N/A',
    'Service Provider': record.serviceProvider || 'N/A'
  }));

  exportToCSV(processedData, `maintenance_${new Date().toISOString().split('T')[0]}.csv`);
};

// Advanced export with filters and date ranges
export const exportWithFilters = (data, type, filters = {}) => {
  let filteredData = [...data];

  // Apply date range filter
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.createdAt || item.date || item.scheduledDate);
      return itemDate >= start && itemDate <= end;
    });
  }

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filteredData = filteredData.filter(item => item.status === filters.status);
  }

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredData = filteredData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );
  }

  // Export based on type
  switch (type) {
    case 'vehicles':
      exportVehicles(filteredData);
      break;
    case 'drivers':
      exportDrivers(filteredData);
      break;
    case 'trips':
      exportTrips(filteredData);
      break;
    case 'fuel':
      exportFuelLogs(filteredData);
      break;
    case 'maintenance':
      exportMaintenanceRecords(filteredData);
      break;
    default:
      exportToCSV(filteredData, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
  }
};

// Generate comprehensive fleet report
export const exportFleetReport = (data) => {
  const { vehicles, drivers, trips, fuelLogs, maintenance } = data;
  
  const report = {
    summary: {
      totalVehicles: vehicles?.length || 0,
      activeVehicles: vehicles?.filter(v => v.status === 'active').length || 0,
      totalDrivers: drivers?.length || 0,
      activeDrivers: drivers?.filter(d => d.status === 'active').length || 0,
      totalTrips: trips?.length || 0,
      completedTrips: trips?.filter(t => t.status === 'completed').length || 0,
      totalFuelCost: fuelLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0,
      pendingMaintenance: maintenance?.filter(m => m.status === 'pending').length || 0
    },
    vehicles: vehicles || [],
    drivers: drivers || [],
    trips: trips || [],
    fuelLogs: fuelLogs || [],
    maintenance: maintenance || []
  };

  exportToJSON(report, `fleet_report_${new Date().toISOString().split('T')[0]}.json`);
};

export default {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToPDF,
  exportVehicles,
  exportDrivers,
  exportTrips,
  exportFuelLogs,
  exportMaintenanceRecords,
  exportWithFilters,
  exportFleetReport
};
