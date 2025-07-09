import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Filter, Calendar, AlertTriangle } from 'lucide-react';

const SafeMaintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    vehicle: '',
    type: 'scheduled',
    category: 'oil-change',
    priority: 'medium',
    scheduledDate: '',
    estimatedCost: '',
    description: ''
  });

  useEffect(() => {
    // Simple demo data - no API calls to avoid import issues
    const loadMaintenance = () => {
      setLoading(true);

      // Simulate loading delay
      setTimeout(() => {
        setMaintenanceRecords([
          {
            _id: '1',
            title: 'Oil Change',
            vehicle: { plateNumber: 'ABC-123', make: 'Toyota', model: 'Camry' },
            type: 'scheduled',
            category: 'oil-change',
            priority: 'medium',
            status: 'pending',
            scheduledDate: '2024-01-15',
            estimatedCost: 150
          },
          {
            _id: '2',
            title: 'Brake Inspection',
            vehicle: { plateNumber: 'XYZ-789', make: 'Honda', model: 'Civic' },
            type: 'inspection',
            category: 'brakes',
            priority: 'high',
            status: 'in-progress',
            scheduledDate: '2024-01-10',
            estimatedCost: 300
          },
          {
            _id: '3',
            title: 'Tire Rotation',
            vehicle: { plateNumber: 'DEF-456', make: 'Ford', model: 'Focus' },
            type: 'scheduled',
            category: 'tires',
            priority: 'low',
            status: 'completed',
            scheduledDate: '2024-01-05',
            estimatedCost: 80
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadMaintenance();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleScheduleMaintenance = () => {
    setSelectedRecord(null);
    setFormData({
      title: '',
      vehicle: '',
      type: 'scheduled',
      category: 'oil-change',
      priority: 'medium',
      scheduledDate: '',
      estimatedCost: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      title: record.title,
      vehicle: record.vehicle?.plateNumber || '',
      type: record.type,
      category: record.category,
      priority: record.priority,
      scheduledDate: record.scheduledDate,
      estimatedCost: record.estimatedCost,
      description: record.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteRecord = (recordId) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      setMaintenanceRecords(maintenanceRecords.filter(record => record._id !== recordId));
      alert('Maintenance record deleted successfully!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedRecord) {
      // Edit existing record
      const updatedRecord = {
        ...selectedRecord,
        ...formData,
        vehicle: {
          plateNumber: formData.vehicle || selectedRecord.vehicle?.plateNumber || 'ABC-123',
          make: selectedRecord.vehicle?.make || 'Toyota',
          model: selectedRecord.vehicle?.model || 'Camry'
        },
        updatedAt: new Date().toISOString()
      };

      setMaintenanceRecords(maintenanceRecords.map(record =>
        record._id === selectedRecord._id ? updatedRecord : record
      ));

      alert('Maintenance record updated successfully!');
    } else {
      // Create new maintenance record
      const newRecord = {
        _id: Date.now().toString(),
        ...formData,
        vehicle: {
          plateNumber: formData.vehicle || 'ABC-123',
          make: 'Toyota',
          model: 'Camry'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Add to records
      setMaintenanceRecords([newRecord, ...maintenanceRecords]);

      alert('Maintenance scheduled successfully!');
    }

    // Reset form and close modal
    setFormData({
      title: '',
      vehicle: '',
      type: 'scheduled',
      category: 'oil-change',
      priority: 'medium',
      scheduledDate: '',
      estimatedCost: '',
      description: ''
    });
    setSelectedRecord(null);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading maintenance records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Wrench className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance (Safe Mode)</h1>
            <p className="text-gray-600">Simplified maintenance management</p>
          </div>
        </div>
        <button
          onClick={handleScheduleMaintenance}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-800">
              <strong>⚠️ Warning:</strong> {error}
            </div>
          </div>
          <p className="text-yellow-700 text-sm mt-1">Showing demo data instead.</p>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedRecord ? 'Edit Maintenance' : 'Schedule Maintenance'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Oil Change, Brake Inspection"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Plate Number
                  </label>
                  <input
                    type="text"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC-123"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="emergency">Emergency</option>
                    <option value="inspection">Inspection</option>
                    <option value="repair">Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="oil-change">Oil Change</option>
                    <option value="brakes">Brakes</option>
                    <option value="tires">Tires</option>
                    <option value="engine">Engine</option>
                    <option value="transmission">Transmission</option>
                    <option value="electrical">Electrical</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the maintenance work needed..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedRecord ? 'Update Maintenance' : 'Schedule Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search maintenance records..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.title}</div>
                        <div className="text-sm text-gray-500">{record.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.vehicle?.plateNumber}</div>
                    <div className="text-sm text-gray-500">
                      {record.vehicle?.make} {record.vehicle?.model}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(record.priority)}`}>
                      {record.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {new Date(record.scheduledDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.estimatedCost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {maintenanceRecords.length === 0 && !loading && (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records found</h3>
            <p className="text-gray-500">Get started by scheduling your first maintenance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeMaintenance;
