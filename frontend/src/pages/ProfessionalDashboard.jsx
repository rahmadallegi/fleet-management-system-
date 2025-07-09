import React, { useState, useEffect } from 'react';
import {
  Car, Users, Route, Fuel, Wrench, TrendingUp, AlertTriangle, CheckCircle,
  Clock, DollarSign, BarChart3, PieChart, Activity, Calendar, MapPin, Zap,
  ArrowUp, ArrowDown, RefreshCw, Bell, Download, Filter
} from 'lucide-react';
import { useRole } from '../contexts/RoleContext';

const ProfessionalDashboard = () => {
  const { userRole, getRoleName } = useRole();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState({
    kpis: {},
    charts: {},
    alerts: [],
    recentActivity: []
  });

  // Simulate loading professional dashboard data
  useEffect(() => {
    const loadDashboardData = () => {
      setLoading(true);
      setTimeout(() => {
        setDashboardData({
          kpis: {
            totalVehicles: { value: 45, change: 5.2, trend: 'up' },
            activeTrips: { value: 12, change: -2.1, trend: 'down' },
            fuelEfficiency: { value: 8.4, change: 3.7, trend: 'up' },
            maintenanceCost: { value: 15420, change: -8.3, trend: 'down' },
            driverUtilization: { value: 87.5, change: 2.8, trend: 'up' },
            revenue: { value: 125340, change: 12.4, trend: 'up' }
          },
          charts: {
            vehicleStatus: [
              { name: 'Available', value: 28, color: '#10B981' },
              { name: 'In Use', value: 12, color: '#3B82F6' },
              { name: 'Maintenance', value: 3, color: '#F59E0B' },
              { name: 'Out of Service', value: 2, color: '#EF4444' }
            ],
            weeklyTrips: [
              { day: 'Mon', trips: 45, fuel: 320 },
              { day: 'Tue', trips: 52, fuel: 380 },
              { day: 'Wed', trips: 48, fuel: 350 },
              { day: 'Thu', trips: 61, fuel: 420 },
              { day: 'Fri', trips: 55, fuel: 390 },
              { day: 'Sat', trips: 38, fuel: 280 },
              { day: 'Sun', trips: 32, fuel: 240 }
            ]
          },
          alerts: [
            { id: 1, type: 'warning', title: 'Vehicle ABC-123 due for maintenance', time: '2 hours ago' },
            { id: 2, type: 'error', title: 'Driver John Doe exceeded speed limit', time: '4 hours ago' },
            { id: 3, type: 'info', title: 'New trip request from Marketing Dept', time: '6 hours ago' },
            { id: 4, type: 'success', title: 'Monthly fuel target achieved', time: '1 day ago' }
          ],
          recentActivity: [
            { id: 1, action: 'Trip completed', details: 'ABC-123 → Downtown Office', time: '15 min ago', user: 'John Doe' },
            { id: 2, action: 'Maintenance scheduled', details: 'XYZ-789 - Oil Change', time: '1 hour ago', user: 'System' },
            { id: 3, action: 'New driver added', details: 'Sarah Johnson (EMP004)', time: '2 hours ago', user: 'Admin' },
            { id: 4, action: 'Fuel log updated', details: 'DEF-456 - $85.50', time: '3 hours ago', user: 'Mike Wilson' }
          ]
        });
        setLoading(false);
      }, 1500);
    };

    loadDashboardData();
  }, [timeRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Simulate data refresh
    }, 1000);
  };

  const KPICard = ({ title, value, change, trend, icon: Icon, format = 'number' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val}%`;
      if (format === 'decimal') return val.toFixed(1);
      return val.toLocaleString();
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const AlertItem = ({ alert }) => {
    const getAlertColor = (type) => {
      switch (type) {
        case 'error': return 'bg-red-50 border-red-200 text-red-800';
        case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'success': return 'bg-green-50 border-green-200 text-green-800';
        default: return 'bg-blue-50 border-blue-200 text-blue-800';
      }
    };

    return (
      <div className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.title}</p>
            <p className="text-xs opacity-75 mt-1">{alert.time}</p>
          </div>
          <Bell className="h-4 w-4 opacity-60" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading professional dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {getRoleName()} • Real-time insights and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <KPICard
          title="Total Vehicles"
          value={dashboardData.kpis.totalVehicles?.value}
          change={dashboardData.kpis.totalVehicles?.change}
          trend={dashboardData.kpis.totalVehicles?.trend}
          icon={Car}
        />
        <KPICard
          title="Active Trips"
          value={dashboardData.kpis.activeTrips?.value}
          change={dashboardData.kpis.activeTrips?.change}
          trend={dashboardData.kpis.activeTrips?.trend}
          icon={Route}
        />
        <KPICard
          title="Fuel Efficiency"
          value={dashboardData.kpis.fuelEfficiency?.value}
          change={dashboardData.kpis.fuelEfficiency?.change}
          trend={dashboardData.kpis.fuelEfficiency?.trend}
          icon={Fuel}
          format="decimal"
        />
        <KPICard
          title="Maintenance Cost"
          value={dashboardData.kpis.maintenanceCost?.value}
          change={dashboardData.kpis.maintenanceCost?.change}
          trend={dashboardData.kpis.maintenanceCost?.trend}
          icon={Wrench}
          format="currency"
        />
        <KPICard
          title="Driver Utilization"
          value={dashboardData.kpis.driverUtilization?.value}
          change={dashboardData.kpis.driverUtilization?.change}
          trend={dashboardData.kpis.driverUtilization?.trend}
          icon={Users}
          format="percentage"
        />
        <KPICard
          title="Monthly Revenue"
          value={dashboardData.kpis.revenue?.value}
          change={dashboardData.kpis.revenue?.change}
          trend={dashboardData.kpis.revenue?.trend}
          icon={DollarSign}
          format="currency"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Vehicle Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Status</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {dashboardData.charts.vehicleStatus?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData.charts.weeklyTrips?.map((day, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(day.trips / 70) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{day.trips}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {dashboardData.alerts?.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData.recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time} • by {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
