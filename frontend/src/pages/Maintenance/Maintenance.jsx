import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Filter, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { maintenanceAPI } from '../../services/api';
import MaintenanceModal from '../../components/MaintenanceModal';

const Maintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await maintenanceAPI.getAll({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 20
      });
      setMaintenanceRecords(response.data?.maintenanceRecords || []);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
      setError('Unable to connect to server. Showing demo data.');
      // Demo data when API is not available
      setMaintenanceRecords([
        {
          _id: '1',
          vehicle: { plateNumber: 'FL-001', make: 'Ford', model: 'Transit' },
          type: 'scheduled',
          category: 'oil-change',
          title: 'Oil Change Service',
          description: 'Regular oil change and filter replacement',
          status: 'scheduled',
          priority: 'medium',
          scheduledDate: '2024-02-01',
          estimatedCost: 85.00,
          odometer: { reading: 45000, unit: 'km' },
          serviceProvider: 'AutoCare Center'
        },
        {
          _id: '2',
          vehicle: { plateNumber: 'FL-002', make: 'Mercedes', model: 'Sprinter' },
          type: 'repair',
          category: 'brake-system',
          title: 'Brake Pad Replacement',
          description: 'Front brake pads need replacement',
          status: 'in-progress',
          priority: 'high',
          scheduledDate: '2024-01-28',
          estimatedCost: 320.00,
          actualCost: 285.00,
          odometer: { reading: 23500, unit: 'km' },
          serviceProvider: 'Brake Specialists Inc'
        },
        {
          _id: '3',
          vehicle: { plateNumber: 'FL-003', make: 'Isuzu', model: 'NPR' },
          type: 'inspection',
          category: 'annual-inspection',
          title: 'Annual Safety Inspection',
          description: 'Mandatory annual vehicle safety inspection',
          status: 'completed',
          priority: 'high',
          scheduledDate: '2024-01-20',
          completedDate: '2024-01-20',
          estimatedCost: 150.00,
          actualCost: 150.00,
          odometer: { reading: 67800, unit: 'km' },
          serviceProvider: 'State Inspection Center'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRecords();
  }, [searchTerm, statusFilter]);

  const handleScheduleMaintenance = () => {
    setSelectedMaintenance(null);
    setShowModal(true);
  };

  const handleEditMaintenance = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowModal(true);
  };

  const handleSaveMaintenance = async (maintenanceData) => {
    try {
      if (selectedMaintenance) {
        await maintenanceAPI.update(selectedMaintenance._id, maintenanceData);
        setSuccessMessage('Maintenance record updated successfully!');
      } else {
        await maintenanceAPI.create(maintenanceData);
        setSuccessMessage('Maintenance scheduled successfully!');
      }

      await fetchMaintenanceRecords();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving maintenance:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMaintenance(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.vehicle?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.serviceProvider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalCost = filteredRecords.reduce((sum, record) => sum + (record.actualCost || record.estimatedCost || 0), 0);
  const overdueCount = filteredRecords.filter(record => record.status === 'overdue').length;
  const scheduledCount = filteredRecords.filter(record => record.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="mt-2 text-gray-600">
            Schedule and track vehicle maintenance
          </p>
        </div>
        <button
          onClick={handleScheduleMaintenance}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
              <p className="text-2xl font-semibold text-gray-900">{overdueCount}</p>
              <p className="text-sm text-gray-600">Require attention</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Scheduled</h3>
              <p className="text-2xl font-semibold text-gray-900">{scheduledCount}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
              <p className="text-2xl font-semibold text-gray-900">${totalCost.toFixed(2)}</p>
              <p className="text-sm text-gray-600">This period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <Wrench className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Connection Issue</h3>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search maintenance records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Maintenance Records Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div key={record._id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {record.title}
                  </h3>
                  <p className="text-gray-600">{record.vehicle?.plateNumber}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(record.priority)}`}>
                    {record.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{record.type}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">{record.category?.replace('-', ' ')}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Scheduled:</span>
                  <span className="font-medium">
                    {new Date(record.scheduledDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Cost:</span>
                  <span className="font-medium">
                    ${(record.actualCost || record.estimatedCost || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Odometer:</span>
                  <span className="font-medium">
                    {record.odometer?.reading?.toLocaleString()} {record.odometer?.unit}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Provider:</span>
                  <p className="font-medium mt-1">{record.serviceProvider}</p>
                </div>

                {record.description && (
                  <div className="text-sm">
                    <span className="text-gray-500">Description:</span>
                    <p className="text-gray-700 mt-1">{record.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleEditMaintenance(record)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Edit Record
                  </button>
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Service History"
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by scheduling your first maintenance.'}
          </p>
          <div className="mt-6">
            <button
              onClick={handleScheduleMaintenance}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Maintenance</span>
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveMaintenance}
        maintenance={selectedMaintenance}
      />
    </div>
  );
};

export default Maintenance;
