import React, { useState, useEffect } from 'react';
import { Fuel as FuelIcon, Plus, Search, Filter, Calendar, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { fuelAPI } from '../../services/api';
import FuelModal from '../../components/FuelModal';

const Fuel = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedFuelLog, setSelectedFuelLog] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fuelAPI.getAll({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 20
      });
      setFuelLogs(response.data?.fuelLogs || []);
    } catch (err) {
      console.error('Error fetching fuel logs:', err);
      setError('Unable to connect to server. Showing demo data.');
      // Demo data when API is not available
      setFuelLogs([
        {
          id: '1',
          vehicle: { plateNumber: 'FL-001', make: 'Ford', model: 'Transit' },
          driver: { firstName: 'John', lastName: 'Smith' },
          date: '2024-01-25',
          time: '14:30',
          fuelType: 'gasoline',
          quantity: { amount: 45.5, unit: 'liters' },
          cost: { pricePerUnit: 1.45, totalAmount: 65.98, currency: 'USD' },
          odometer: { reading: 45230, unit: 'km' },
          location: { stationName: 'Shell Station', address: '123 Main St' },
          isFillUp: true,
          status: 'approved'
        },
        {
          id: '2',
          vehicle: { plateNumber: 'FL-002', make: 'Mercedes', model: 'Sprinter' },
          driver: { firstName: 'Sarah', lastName: 'Johnson' },
          date: '2024-01-24',
          time: '09:15',
          fuelType: 'diesel',
          quantity: { amount: 38.2, unit: 'liters' },
          cost: { pricePerUnit: 1.52, totalAmount: 58.06, currency: 'USD' },
          odometer: { reading: 23450, unit: 'km' },
          location: { stationName: 'BP Station', address: '456 Oak Ave' },
          isFillUp: false,
          status: 'pending'
        },
        {
          id: '3',
          vehicle: { plateNumber: 'FL-003', make: 'Isuzu', model: 'NPR' },
          driver: { firstName: 'Mike', lastName: 'Wilson' },
          date: '2024-01-23',
          time: '16:45',
          fuelType: 'diesel',
          quantity: { amount: 52.8, unit: 'liters' },
          cost: { pricePerUnit: 1.48, totalAmount: 78.14, currency: 'USD' },
          odometer: { reading: 67890, unit: 'km' },
          location: { stationName: 'Exxon Station', address: '789 Pine St' },
          isFillUp: true,
          status: 'approved'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelLogs();
  }, [searchTerm, statusFilter]);

  const handleAddFuelLog = () => {
    setSelectedFuelLog(null);
    setShowModal(true);
  };

  const handleEditFuelLog = (fuelLog) => {
    setSelectedFuelLog(fuelLog);
    setShowModal(true);
  };

  const handleSaveFuelLog = async (fuelLogData) => {
    try {
      if (selectedFuelLog) {
        await fuelAPI.update(selectedFuelLog.id, fuelLogData);
        setSuccessMessage('Fuel log updated successfully!');
      } else {
        await fuelAPI.create(fuelLogData);
        setSuccessMessage('Fuel log added successfully!');
      }

      await fetchFuelLogs();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving fuel log:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFuelLog(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFuelLogs = fuelLogs.filter(log => {
    const matchesSearch = log.vehicle?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.driver?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.driver?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.location?.stationName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalCost = filteredFuelLogs.reduce((sum, log) => sum + (log.cost?.totalAmount || 0), 0);
  const totalQuantity = filteredFuelLogs.reduce((sum, log) => sum + (log.quantity?.amount || 0), 0);
  const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fuel Management</h1>
          <p className="mt-2 text-gray-600">
            Track fuel usage, costs, and efficiency
          </p>
        </div>
        <button
          onClick={handleAddFuelLog}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Fuel Log</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
              <p className="text-2xl font-semibold text-gray-900">${totalCost.toFixed(2)}</p>
              <p className="text-sm text-gray-600">This period</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FuelIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Fuel</h3>
              <p className="text-2xl font-semibold text-gray-900">{totalQuantity.toFixed(1)}L</p>
              <p className="text-sm text-gray-600">Consumed</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
              <p className="text-2xl font-semibold text-gray-900">${averagePrice.toFixed(2)}/L</p>
              <p className="text-sm text-gray-600">Per liter</p>
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
            <FuelIcon className="h-5 w-5 text-yellow-400" />
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
            placeholder="Search fuel logs..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Fuel Logs Table */}
      {loading ? (
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredFuelLogs.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle & Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.vehicle?.plateNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.driver?.firstName} {log.driver?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{log.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.quantity?.amount} {log.quantity?.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.fuelType} {log.isFillUp && '(Fill-up)'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${log.cost?.totalAmount?.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${log.cost?.pricePerUnit?.toFixed(2)}/{log.quantity?.unit?.charAt(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditFuelLog(log)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FuelIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No fuel logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first fuel log.'}
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddFuelLog}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Fuel Log</span>
            </button>
          </div>
        </div>
      )}

      {/* Fuel Modal */}
      <FuelModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveFuelLog}
        fuelLog={selectedFuelLog}
      />
    </div>
  );
};

export default Fuel;
