import React, { useState, useEffect } from 'react';
import { X, Fuel, Save, Loader } from 'lucide-react';
import { vehiclesAPI, driversAPI } from '../services/api';

const FuelModal = ({ isOpen, onClose, onSave, fuelLog = null }) => {
  const [formData, setFormData] = useState({
    vehicle: fuelLog?.vehicle?._id || '',
    driver: fuelLog?.driver?._id || '',
    date: fuelLog?.date || new Date().toISOString().split('T')[0],
    time: fuelLog?.time || new Date().toTimeString().slice(0, 5),
    fuelType: fuelLog?.fuelType || 'gasoline',
    quantity: {
      amount: fuelLog?.quantity?.amount || '',
      unit: fuelLog?.quantity?.unit || 'liters'
    },
    cost: {
      pricePerUnit: fuelLog?.cost?.pricePerUnit || '',
      totalAmount: fuelLog?.cost?.totalAmount || '',
      currency: fuelLog?.cost?.currency || 'USD'
    },
    odometer: {
      reading: fuelLog?.odometer?.reading || '',
      unit: fuelLog?.odometer?.unit || 'km'
    },
    location: {
      stationName: fuelLog?.location?.stationName || '',
      address: fuelLog?.location?.address || ''
    },
    receipt: {
      number: fuelLog?.receipt?.number || '',
      notes: fuelLog?.receipt?.notes || ''
    },
    isFillUp: fuelLog?.isFillUp || false
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchVehiclesAndDrivers();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-calculate total amount when quantity or price changes
    const amount = parseFloat(formData.quantity.amount) || 0;
    const pricePerUnit = parseFloat(formData.cost.pricePerUnit) || 0;
    const totalAmount = (amount * pricePerUnit).toFixed(2);
    
    if (amount > 0 && pricePerUnit > 0) {
      setFormData(prev => ({
        ...prev,
        cost: {
          ...prev.cost,
          totalAmount: totalAmount
        }
      }));
    }
  }, [formData.quantity.amount, formData.cost.pricePerUnit]);

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesResponse, driversResponse] = await Promise.all([
        vehiclesAPI.getAll().catch(() => ({ data: { vehicles: [] } })),
        driversAPI.getAll().catch(() => ({ data: { drivers: [] } }))
      ]);
      
      setVehicles(vehiclesResponse.data?.vehicles || []);
      setDrivers(driversResponse.data?.drivers || []);
    } catch (error) {
      console.error('Error fetching vehicles and drivers:', error);
      // Set demo data
      setVehicles([
        { _id: '1', plateNumber: 'FL-001', make: 'Ford', model: 'Transit' },
        { _id: '2', plateNumber: 'FL-002', make: 'Mercedes', model: 'Sprinter' }
      ]);
      setDrivers([
        { _id: '1', firstName: 'John', lastName: 'Smith' },
        { _id: '2', firstName: 'Sarah', lastName: 'Johnson' }
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle selection is required';
    }
    if (!formData.driver) {
      newErrors.driver = 'Driver selection is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    if (!formData.quantity.amount || parseFloat(formData.quantity.amount) <= 0) {
      newErrors.amount = 'Valid fuel quantity is required';
    }
    if (!formData.cost.pricePerUnit || parseFloat(formData.cost.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Valid price per unit is required';
    }
    if (!formData.odometer.reading || parseFloat(formData.odometer.reading) < 0) {
      newErrors.odometerReading = 'Valid odometer reading is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        vehicle: '',
        driver: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        fuelType: 'gasoline',
        quantity: { amount: '', unit: 'liters' },
        cost: { pricePerUnit: '', totalAmount: '', currency: 'USD' },
        odometer: { reading: '', unit: 'km' },
        location: { stationName: '', address: '' },
        receipt: { number: '', notes: '' },
        isFillUp: false
      });
    } catch (error) {
      console.error('Error saving fuel log:', error);
      setErrors({ submit: error.message || 'Failed to save fuel log' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Fuel className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {fuelLog ? 'Edit Fuel Log' : 'Add Fuel Log'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.vehicle ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
                {errors.vehicle && (
                  <p className="text-sm text-red-600 mt-1">{errors.vehicle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
                <select
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.driver ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>
                {errors.driver && (
                  <p className="text-sm text-red-600 mt-1">{errors.driver}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-sm text-red-600 mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.time ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.time && (
                  <p className="text-sm text-red-600 mt-1">{errors.time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading *</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="odometer.reading"
                    value={formData.odometer.reading}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.odometerReading ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Reading"
                  />
                  <select
                    name="odometer.unit"
                    value={formData.odometer.unit}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="km">km</option>
                    <option value="miles">miles</option>
                  </select>
                </div>
                {errors.odometerReading && (
                  <p className="text-sm text-red-600 mt-1">{errors.odometerReading}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fuel Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fuel Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    name="quantity.amount"
                    value={formData.quantity.amount}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Amount"
                  />
                  <select
                    name="quantity.unit"
                    value={formData.quantity.unit}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="liters">Liters</option>
                    <option value="gallons">Gallons</option>
                  </select>
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit *</label>
                <div className="flex space-x-2">
                  <select
                    name="cost.currency"
                    value={formData.cost.currency}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    name="cost.pricePerUnit"
                    value={formData.cost.pricePerUnit}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.pricePerUnit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Price"
                  />
                </div>
                {errors.pricePerUnit && (
                  <p className="text-sm text-red-600 mt-1">{errors.pricePerUnit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost.totalAmount"
                  value={formData.cost.totalAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="Auto-calculated"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFillUp"
                  checked={formData.isFillUp}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">This is a fill-up (tank was filled completely)</span>
              </label>
            </div>
          </div>

          {/* Location & Receipt */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Receipt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Name</label>
                <input
                  type="text"
                  name="location.stationName"
                  value={formData.location.stationName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Shell Station"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Address</label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Station address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                <input
                  type="text"
                  name="receipt.number"
                  value={formData.receipt.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Receipt number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="receipt.notes"
                  value={formData.receipt.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Saving...' : 'Save Fuel Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelModal;
