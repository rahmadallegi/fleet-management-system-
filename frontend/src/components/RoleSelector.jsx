import React from 'react';
import { Shield, User, Package } from 'lucide-react';

const RoleSelector = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with user management, reporting, and settings',
      icon: Shield,
      color: 'bg-red-500 hover:bg-red-600',
      credentials: { email: 'admin@fleet.com', password: 'admin123' },
      features: [
        'User Management',
        'Vehicle Management', 
        'Reporting & Analytics',
        'System Settings',
        'All Permissions'
      ]
    },
    {
      id: 'user',
      name: 'Regular User',
      description: 'Request vehicles, equipment, and maintenance services',
      icon: User,
      color: 'bg-blue-500 hover:bg-blue-600',
      credentials: { email: 'user@fleet.com', password: 'user123' },
      features: [
        'Vehicle Requests',
        'Equipment Requests',
        'Maintenance Requests',
        'View Own Trips',
        'Request Status Tracking'
      ]
    },
    {
      id: 'warehouse',
      name: 'Warehouse Manager',
      description: 'Track vehicle status, manage schedules, and monitor equipment',
      icon: Package,
      color: 'bg-green-500 hover:bg-green-600',
      credentials: { email: 'warehouse@fleet.com', password: 'warehouse123' },
      features: [
        'Vehicle Tracking',
        'Equipment Status',
        'Strike Schedules',
        'Maintenance Monitoring',
        'Status Updates'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fleet Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose your role to access the system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => onRoleSelect(role.credentials)}
              >
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${role.color} text-white mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {role.name}
                    </h3>
                    <p className="text-gray-600">
                      {role.description}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-900">Features:</h4>
                    <ul className="space-y-2">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Demo Credentials:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Email:</strong> {role.credentials.email}</div>
                      <div><strong>Password:</strong> {role.credentials.password}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRoleSelect(role.credentials)}
                    className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${role.color}`}
                  >
                    Login as {role.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            This is a demo system. Click any role above to login with pre-configured credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
