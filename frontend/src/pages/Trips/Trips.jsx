import React, { useState, useEffect } from 'react';
import { Route, Plus, Search, Filter, MapPin, Clock, CheckCircle, Play, Square } from 'lucide-react';
import { tripsAPI } from '../../services/api';
import TripModal from '../../components/TripModal';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripsAPI.getAll({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 20
      });
      setTrips(response.data?.trips || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Unable to load trips. Please check your connection and try again.');
      setTrips([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [searchTerm, statusFilter]);

  const handleCreateTrip = () => {
    setSelectedTrip(null);
    setShowModal(true);
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };

  const handleSaveTrip = async (tripData) => {
    try {
      if (selectedTrip) {
        await tripsAPI.update(selectedTrip._id, tripData);
        setSuccessMessage('Trip updated successfully!');
      } else {
        await tripsAPI.create(tripData);
        setSuccessMessage('Trip created successfully!');
      }

      await fetchTrips();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving trip:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.tripNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.vehicle?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trips</h1>
          <p className="mt-2 text-gray-600">
            Manage and track your fleet trips
          </p>
        </div>
        <button
          onClick={handleCreateTrip}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Trip</span>
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
            <Route className="h-5 w-5 text-yellow-400" />
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
            placeholder="Search trips..."
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
            <option value="planned">Planned</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
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
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div key={trip._id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trip.tripNumber}
                  </h3>
                  <p className="text-gray-600">{trip.purpose}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(trip.priority)}`}>
                    {trip.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="font-medium">{trip.vehicle?.plateNumber}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Driver:</span>
                  <span className="font-medium">
                    {trip.driver?.firstName} {trip.driver?.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Distance:</span>
                  <span className="font-medium">
                    {trip.route?.estimatedDistance?.value} {trip.route?.estimatedDistance?.unit}
                  </span>
                </div>

                <div className="text-sm">
                  <div className="flex items-center space-x-1 text-gray-500 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>From:</span>
                  </div>
                  <p className="text-gray-700 text-xs ml-4">{trip.route?.origin?.address}</p>
                </div>

                <div className="text-sm">
                  <div className="flex items-center space-x-1 text-gray-500 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>To:</span>
                  </div>
                  <p className="text-gray-700 text-xs ml-4">{trip.route?.destination?.address}</p>
                </div>

                <div className="text-sm">
                  <div className="flex items-center space-x-1 text-gray-500 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Schedule:</span>
                  </div>
                  <p className="text-gray-700 text-xs ml-4">
                    {new Date(trip.schedule?.plannedStart).toLocaleDateString()} - {new Date(trip.schedule?.plannedEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleEditTrip(trip)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Edit Trip
                  </button>
                  <div className="flex space-x-2">
                    {trip.status === 'planned' && (
                      <button
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        title="Start Trip"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    {trip.status === 'in-progress' && (
                      <button
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Complete Trip"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Route"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Route className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first trip.'}
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateTrip}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Trip</span>
            </button>
          </div>
        </div>
      )}

      {/* Trip Modal */}
      <TripModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveTrip}
        trip={selectedTrip}
      />
    </div>
  );
};

export default Trips;
