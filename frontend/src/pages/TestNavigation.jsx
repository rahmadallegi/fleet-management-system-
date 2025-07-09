import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TestNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const testRoutes = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Vehicles', path: '/dashboard/vehicles' },
    { name: 'Drivers', path: '/dashboard/drivers' },
    { name: 'Trips', path: '/dashboard/trips' },
    { name: 'Fuel', path: '/dashboard/fuel' },
    { name: 'Maintenance', path: '/dashboard/maintenance' },
    { name: 'Reports', path: '/dashboard/reports' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  const handleNavigation = (path, name) => {
    try {
      console.log(`🧪 TestNavigation: Attempting to navigate to ${name} (${path})`);
      navigate(path);
      console.log(`✅ TestNavigation: Successfully navigated to ${name}`);
    } catch (error) {
      console.error(`❌ TestNavigation: Failed to navigate to ${name}:`, error);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Navigation Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Location</h2>
          <p className="text-gray-600">
            <strong>Pathname:</strong> {location.pathname}
          </p>
          <p className="text-gray-600">
            <strong>Search:</strong> {location.search || 'None'}
          </p>
          <p className="text-gray-600">
            <strong>Hash:</strong> {location.hash || 'None'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Test Navigation</h2>
          <p className="text-gray-600 mb-4">
            Click each button to test navigation. Check the browser console for detailed logs.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {testRoutes.map((route) => (
              <button
                key={route.path}
                onClick={() => handleNavigation(route.path, route.name)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  location.pathname === route.path
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {route.name}
                {location.pathname === route.path && (
                  <span className="block text-xs text-blue-500 mt-1">Current</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Instructions</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Open browser Developer Tools (F12)</li>
            <li>• Go to Console tab</li>
            <li>• Click navigation buttons and watch for errors</li>
            <li>• If a page crashes, the error will be logged</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestNavigation;
