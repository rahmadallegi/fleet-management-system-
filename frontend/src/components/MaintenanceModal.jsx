import React, { useState, useEffect } from 'react';
import { X, Wrench, Save, Loader } from 'lucide-react';
import { vehiclesAPI } from '../services/api';

const MaintenanceModal = ({ isOpen, onClose, onSave, maintenance = null }) => {
  const [formData, setFormData] = useState({
  vehicle: maintenance?.vehicle?.id || '',
    type: maintenance?.type || 'scheduled',
    category: maintenance?.category || 'oil-change',
    title: maintenance?.title || '',
    description: maintenance?.description || '',
    priority: maintenance?.priority || 'medium',
    scheduledDate: maintenance?.scheduledDate || '',
    estimatedCost: maintenance?.estimatedCost || '',
    odometer: {
      reading: maintenance?.odometer?.reading || '',
      unit: maintenance?.odometer?.unit || 'km'
    },
    serviceProvider: maintenance?.serviceProvider || '',
    notes: maintenance?.notes || '',
    reminderDays: maintenance?.reminderDays || 7
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll().catch(() => ({ data: { vehicles: [] } }));
      setVehicles(response.data?.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Set demo data
      setVehicles([
        { id: '1', plateNumber: 'FL-001', make: 'Ford', model: 'Transit' },
        { id: '2', plateNumber: 'FL-002', make: 'Mercedes', model: 'Sprinter' },
        { id: '3', plateNumber: 'FL-003', make: 'Isuzu', model: 'NPR' }
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
    if (!formData.title.trim()) {
      newErrors.title = 'Maintenance title is required';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }
    if (!formData.serviceProvider.trim()) {
      newErrors.serviceProvider = 'Service provider is required';
    }
    if (formData.estimatedCost && parseFloat(formData.estimatedCost) < 0) {
      newErrors.estimatedCost = 'Cost must be a positive number';
    }
    if (formData.odometer.reading && parseFloat(formData.odometer.reading) < 0) {
      newErrors.odometerReading = 'Odometer reading must be positive';
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
        type: 'scheduled',
        category: 'oil-change',
        title: '',
        description: '',
        priority: 'medium',
        scheduledDate: '',
        estimatedCost: '',
        odometer: { reading: '', unit: 'km' },
        serviceProvider: '',
        notes: '',
        reminderDays: 7
      });
    } catch (error) {
      console.error('Error saving maintenance:', error);
      setErrors({ submit: error.message || 'Failed to save maintenance record' });
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
            <Wrench className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {maintenance ? 'Edit Maintenance' : 'Schedule Maintenance'}
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
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
                {errors.vehicle && (
                  <p className="text-sm text-red-600 mt-1">{errors.vehicle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="scheduled">Scheduled Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="oil-change">Oil Change</option>
                  <option value="brake-system">Brake System</option>
                  <option value="tire-service">Tire Service</option>
                  <option value="engine-service">Engine Service</option>
                  <option value="transmission">Transmission</option>
                  <option value="electrical">Electrical</option>
                  <option value="air-conditioning">Air Conditioning</option>
                  <option value="annual-inspection">Annual Inspection</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Oil Change Service"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of maintenance work..."
                />
              </div>
            </div>
          </div>

          {/* Schedule & Cost */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule & Cost</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.scheduledDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                <input
                  type="number"
                  step="0.01"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.estimatedCost ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.estimatedCost && (
                  <p className="text-sm text-red-600 mt-1">{errors.estimatedCost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder (days before)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  name="reminderDays"
                  value={formData.reminderDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Service Provider */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Provider</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider *</label>
                <input
                  type="text"
                  name="serviceProvider"
                  value={formData.serviceProvider}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.serviceProvider ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., AutoCare Center"
                />
                {errors.serviceProvider && (
                  <p className="text-sm text-red-600 mt-1">{errors.serviceProvider}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or special instructions..."
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
              <span>{loading ? 'Saving...' : 'Schedule Maintenance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
