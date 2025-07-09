import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, AlertTriangle, CheckCircle, Calendar, Filter } from 'lucide-react';

const VehicleTracking = () => {
  const [vehicles, setVehicles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('vehicles');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setVehicles([
        {
          id: '1',
          plateNumber: 'ABC-123',
          make: 'Toyota',
          model: 'Camry',
          status: 'in-use',
          location: 'Downtown Office',
          driver: 'John Doe',
          lastUpdate: '2024-01-15T14:30:00Z',
          nextMaintenance: '2024-02-01',
          fuelLevel: 75
        },
        {
          id: '2',
          plateNumber: 'XYZ-789',
          make: 'Honda',
          model: 'Civic',
          status: 'available',
          location: 'Main Warehouse',
          driver: null,
          lastUpdate: '2024-01-15T12:00:00Z',
          nextMaintenance: '2024-01-25',
          fuelLevel: 90
        },
        {
          id: '3',
          plateNumber: 'DEF-456',
          make: 'Ford',
          model: 'Transit',
          status: 'maintenance',
          location: 'Service Center',
          driver: null,
          lastUpdate: '2024-01-14T16:45:00Z',
          nextMaintenance: '2024-01-20',
          fuelLevel: 45
        },
        {
          id: '4',
          plateNumber: 'GHI-321',
          make: 'Chevrolet',
          model: 'Silverado',
          status: 'out-of-service',
          location: 'Repair Shop',
          driver: null,
          lastUpdate: '2024-01-13T10:15:00Z',
          nextMaintenance: '2024-01-30',
          fuelLevel: 20
        }
      ]);

      setSchedules([
        {
          id: '1',
          vehicleId: '1',
          plateNumber: 'ABC-123',
          type: 'pickup',
          requestedBy: 'Jane Smith',
          scheduledDate: '2024-01-16',
          startTime: '09:00',
          endTime: '17:00',
          pickup: '123 Main St',
          destination: '456 Oak Ave',
          status: 'scheduled'
        },
        {
          id: '2',
          vehicleId: '2',
          plateNumber: 'XYZ-789',
          type: 'maintenance',
          requestedBy: 'System',
          scheduledDate: '2024-01-18',
          startTime: '08:00',
          endTime: '12:00',
          location: 'Service Center',
          status: 'pending'
        },
        {
          id: '3',
          vehicleId: '3',
          plateNumber: 'DEF-456',
          type: 'repair',
          requestedBy: 'Mike Johnson',
          scheduledDate: '2024-01-17',
          startTime: '10:00',
          endTime: '15:00',
          location: 'Repair Shop',
          status: 'in-progress'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-use': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out-of-service': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Truck className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFuelLevelColor = (level) => {
    if (level >= 70) return 'bg-green-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredVehicles = vehicles.filter(vehicle => 
    statusFilter === 'all' || vehicle.status === statusFilter
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading tracking data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Truck className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle & Equipment Tracking</h1>
            <p className="text-gray-600">Monitor vehicle status and schedules</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Use</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'in-use').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Service</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'out-of-service').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vehicle Status
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Strike Schedules
            </button>
          </nav>
        </div>

        {activeTab === 'vehicles' && (
          <div>
            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="in-use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out-of-service">Out of Service</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{vehicle.plateNumber}</h3>
                          <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(vehicle.status)}
                        <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {vehicle.location}
                      </div>
                      
                      {vehicle.driver && (
                        <div className="flex items-center text-gray-600">
                          <span className="w-4 h-4 mr-2 text-center">👤</span>
                          {vehicle.driver}
                        </div>
                      )}

                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Updated {new Date(vehicle.lastUpdate).toLocaleString()}
                      </div>

                      {/* Fuel Level */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Fuel Level</span>
                          <span>{vehicle.fuelLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getFuelLevelColor(vehicle.fuelLevel)}`}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Next Maintenance */}
                      <div className="flex items-center text-gray-600 mt-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        Next maintenance: {new Date(vehicle.nextMaintenance).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="p-6">
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {schedule.plateNumber} - {schedule.type}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(schedule.scheduledDate).toLocaleDateString()}
                            <Clock className="h-4 w-4 ml-3 mr-1" />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          
                          {schedule.pickup && schedule.destination && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {schedule.pickup} → {schedule.destination}
                            </div>
                          )}
                          
                          {schedule.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {schedule.location}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500">
                            Requested by: {schedule.requestedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {schedules.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
                <p className="text-gray-500">No upcoming schedules at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleTracking;
