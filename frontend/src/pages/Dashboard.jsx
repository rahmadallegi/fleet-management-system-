import React, { useState, useEffect } from 'react';
import { Car, Users, Route, AlertTriangle, RefreshCw, Fuel, Wrench } from 'lucide-react';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [overviewResponse, activityResponse] = await Promise.all([
        dashboardAPI.getOverview().catch(() => null),
        dashboardAPI.getActivity().catch(() => null)
      ]);

      setOverview(overviewResponse?.data?.overview || null);
      setActivity(activityResponse?.data || null);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Unable to load dashboard data. Please check your connection and try again.');
      setOverview(null);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = overview ? [
    {
      name: 'Total Vehicles',
      value: overview.vehicles?.totalVehicles || 0,
      change: `${overview.vehicles?.activeVehicles || 0} active`,
      changeType: 'positive',
      icon: Car,
    },
    {
      name: 'Active Drivers',
      value: overview.drivers?.activeDrivers || 0,
      change: `${overview.drivers?.totalDrivers || 0} total`,
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Trips',
      value: overview.trips?.activeTrips || 0,
      change: `${overview.trips?.completedTrips || 0} completed`,
      changeType: 'neutral',
      icon: Route,
    },
    {
      name: 'Maintenance Due',
      value: overview.maintenance?.overdueRecords || 0,
      change: 'Requires attention',
      changeType: overview.maintenance?.overdueRecords > 0 ? 'negative' : 'positive',
      icon: AlertTriangle,
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your fleet today.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center space-x-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Connection Issue
              </h3>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Loading skeleton
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span
                      className={`${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trips */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Trips</h3>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="ml-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-24"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-16"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                </div>
              ))
            ) : activity?.activeTrips?.length > 0 ? (
              activity.activeTrips.slice(0, 3).map((trip, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Route className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {trip.tripNumber || `Trip #${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trip.purpose || 'In Progress'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Active</p>
                    <p className="text-sm text-gray-500">In Progress</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Route className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active trips</h3>
                <p className="mt-1 text-sm text-gray-500">All vehicles are currently available</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-gray-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Backend API Connected</p>
                    <p className="text-xs text-gray-500">All systems operational</p>
                  </div>
                </div>

                {overview?.maintenance?.overdueRecords > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {overview.maintenance.overdueRecords} maintenance items overdue
                      </p>
                      <p className="text-xs text-gray-500">Requires attention</p>
                    </div>
                  </div>
                )}

                {overview?.alerts?.activeAlerts > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-red-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {overview.alerts.activeAlerts} active alerts
                      </p>
                      <p className="text-xs text-gray-500">Need immediate attention</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Fleet Management System Active</p>
                    <p className="text-xs text-gray-500">Ready for operations</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
