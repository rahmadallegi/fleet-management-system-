import React, { useState, useEffect } from 'react';
import { X, Route, Save, Loader } from 'lucide-react';
import { vehiclesAPI, driversAPI } from '../services/api';

const TripModal = ({ isOpen, onClose, onSave, trip = null }) => {
  const [formData, setFormData] = useState({
    purpose: trip?.purpose || '',
    description: trip?.description || '',
    vehicle: trip?.vehicle?._id || '',
    driver: trip?.driver?._id || '',
    schedule: {
      plannedStart: trip?.schedule?.plannedStart || '',
      plannedEnd: trip?.schedule?.plannedEnd || ''
    },
    route: {
      origin: {
        address: trip?.route?.origin?.address || '',
        coordinates: trip?.route?.origin?.coordinates || { lat: '', lng: '' }
      },
      destination: {
        address: trip?.route?.destination?.address || '',
        coordinates: trip?.route?.destination?.coordinates || { lat: '', lng: '' }
      },
      estimatedDistance: {
        value: trip?.route?.estimatedDistance?.value || '',
        unit: trip?.route?.estimatedDistance?.unit || 'km'
      }
    },
    priority: trip?.priority || 'medium'
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

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesResponse, driversResponse] = await Promise.all([
        vehiclesAPI.getAvailable().catch(() => ({ data: { vehicles: [] } })),
        driversAPI.getAvailable().catch(() => ({ data: { drivers: [] } }))
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
    const { name, value } = e.target;
    
    if (name.includes('.')) {
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Trip purpose is required';
    }
    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle selection is required';
    }
    if (!formData.driver) {
      newErrors.driver = 'Driver selection is required';
    }
    if (!formData.schedule.plannedStart) {
      newErrors['schedule.plannedStart'] = 'Start date/time is required';
    }
    if (!formData.schedule.plannedEnd) {
      newErrors['schedule.plannedEnd'] = 'End date/time is required';
    }
    if (!formData.route.origin.address.trim()) {
      newErrors['route.origin.address'] = 'Origin address is required';
    }
    if (!formData.route.destination.address.trim()) {
      newErrors['route.destination.address'] = 'Destination address is required';
    }
    
    // Validate dates
    if (formData.schedule.plannedStart && formData.schedule.plannedEnd) {
      const startDate = new Date(formData.schedule.plannedStart);
      const endDate = new Date(formData.schedule.plannedEnd);
      if (endDate <= startDate) {
        newErrors['schedule.plannedEnd'] = 'End time must be after start time';
      }
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
        purpose: '',
        description: '',
        vehicle: '',
        driver: '',
        schedule: { plannedStart: '', plannedEnd: '' },
        route: {
          origin: { address: '', coordinates: { lat: '', lng: '' } },
          destination: { address: '', coordinates: { lat: '', lng: '' } },
          estimatedDistance: { value: '', unit: 'km' }
        },
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error saving trip:', error);
      setErrors({ submit: error.message || 'Failed to save trip' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Route className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {trip ? 'Edit Trip' : 'Create New Trip'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Trip Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Purpose *
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.purpose ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Delivery to Downtown Office"
                />
                {errors.purpose && (
                  <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional trip details..."
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Start *
                </label>
                <input
                  type="datetime-local"
                  name="schedule.plannedStart"
                  value={formData.schedule.plannedStart}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors['schedule.plannedStart'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors['schedule.plannedStart'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['schedule.plannedStart']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned End *
                </label>
                <input
                  type="datetime-local"
                  name="schedule.plannedEnd"
                  value={formData.schedule.plannedEnd}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors['schedule.plannedEnd'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors['schedule.plannedEnd'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['schedule.plannedEnd']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Route */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Route</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origin Address *
                </label>
                <input
                  type="text"
                  name="route.origin.address"
                  value={formData.route.origin.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors['route.origin.address'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Starting location"
                />
                {errors['route.origin.address'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['route.origin.address']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Address *
                </label>
                <input
                  type="text"
                  name="route.destination.address"
                  value={formData.route.destination.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors['route.destination.address'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Destination location"
                />
                {errors['route.destination.address'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['route.destination.address']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Distance
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="route.estimatedDistance.value"
                    value={formData.route.estimatedDistance.value}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Distance"
                  />
                  <select
                    name="route.estimatedDistance.unit"
                    value={formData.route.estimatedDistance.unit}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="km">km</option>
                    <option value="miles">miles</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              <span>{loading ? 'Saving...' : 'Save Trip'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripModal;
