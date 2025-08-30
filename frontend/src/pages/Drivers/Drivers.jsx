import React, { useState, useCallback } from 'react';
import { User, Plus, Search, Filter, Phone, Mail, CheckCircle, Calendar } from 'lucide-react';
import { driversAPI } from '../../services/api';
import DriverModal from '../../components/DriverModal';
import { useApi } from '../../hooks/useApi';

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const getDrivers = useCallback(() => {
    return driversAPI.getAll({
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 20
    });
  }, [searchTerm, statusFilter]);

  const {
    data: driversResponse,
    loading,
    error,
    refetch: refetchDrivers
  } = useApi(getDrivers, [searchTerm, statusFilter]);

  const drivers = driversResponse?.data?.drivers || [];

  const handleAddDriver = () => {
    setSelectedDriver(null);
    setShowModal(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleSaveDriver = async (driverData) => {
    try {
      if (selectedDriver) {
        await driversAPI.update(selectedDriver._id, driverData);
        setSuccessMessage('Driver updated successfully!');
      } else {
        await driversAPI.create(driverData);
        setSuccessMessage('Driver added successfully!');
      }

      await refetchDrivers();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving driver:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDriver(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-duty': return 'bg-blue-100 text-blue-800';
      case 'off-duty': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
          <p className="mt-2 text-gray-600">
            Manage your fleet drivers and track their performance
          </p>
        </div>
        <button
          onClick={handleAddDriver}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Driver</span>
        </button>
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
            <User className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Connection Issue</h3>
              <p className="text-sm text-yellow-700 mt-1">Unable to load drivers. Please check your connection and try again.</p>
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
            placeholder="Search drivers..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Drivers Grid */}
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
      ) : drivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver._id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {driver.firstName} {driver.lastName}
                  </h3>
                  <p className="text-gray-600">ID: {driver.employeeId}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(driver.status)}`}>
                    {driver.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(driver.availability)}`}>
                    {driver.availability}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{driver.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{driver.phone}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">License:</span>
                  <span className="font-medium">{driver.license?.type} - {driver.license?.number}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{driver.performance?.rating || 'N/A'}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Trips:</span>
                  <span className="font-medium">{driver.performance?.totalTrips || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Safety Score:</span>
                  <span className="font-medium">{driver.performance?.safetyScore || 'N/A'}%</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleEditDriver(driver)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Edit Details
                  </button>
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Performance"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Contact Driver"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first driver.'}
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddDriver}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Driver</span>
            </button>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      <DriverModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveDriver}
        driver={selectedDriver}
      />
    </div>
  );
};

export default Drivers;
