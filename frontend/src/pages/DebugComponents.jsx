import React, { useState } from 'react';

const DebugComponents = () => {
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState({});

  const testComponent = async (componentName, testFunction) => {
    setActiveTest(componentName);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [componentName]: { success: true, result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [componentName]: { success: false, error: error.message }
      }));
    }
    setActiveTest(null);
  };

  const testDriversAPI = async () => {
    const { driversAPI } = await import('../services/api');
    const response = await driversAPI.getAll({ limit: 1 });
    return `Drivers API working - ${response.data?.drivers?.length || 0} drivers found`;
  };

  const testTripsAPI = async () => {
    const { tripsAPI } = await import('../services/api');
    const response = await tripsAPI.getAll({ limit: 1 });
    return `Trips API working - ${response.data?.trips?.length || 0} trips found`;
  };

  const testFuelAPI = async () => {
    const { fuelAPI } = await import('../services/api');
    const response = await fuelAPI.getAll({ limit: 1 });
    return `Fuel API working - ${response.data?.fuelRecords?.length || 0} fuel records found`;
  };

  const testMaintenanceAPI = async () => {
    const { maintenanceAPI } = await import('../services/api');
    const response = await maintenanceAPI.getAll({ limit: 1 });
    return `Maintenance API working - ${response.data?.maintenanceRecords?.length || 0} maintenance records found`;
  };

  const testDriversComponent = async () => {
    const DriversComponent = await import('./Drivers/Drivers');
    return 'Drivers component imported successfully';
  };

  const testTripsComponent = async () => {
    const TripsComponent = await import('./Trips/Trips');
    return 'Trips component imported successfully';
  };

  const testFuelComponent = async () => {
    const FuelComponent = await import('./Fuel/Fuel');
    return 'Fuel component imported successfully';
  };

  const testMaintenanceComponent = async () => {
    const MaintenanceComponent = await import('./Maintenance/Maintenance');
    return 'Maintenance component imported successfully';
  };

  const tests = [
    { name: 'Drivers API', test: testDriversAPI },
    { name: 'Trips API', test: testTripsAPI },
    { name: 'Fuel API', test: testFuelAPI },
    { name: 'Maintenance API', test: testMaintenanceAPI },
    { name: 'Drivers Component', test: testDriversComponent },
    { name: 'Trips Component', test: testTripsComponent },
    { name: 'Fuel Component', test: testFuelComponent },
    { name: 'Maintenance Component', test: testMaintenanceComponent },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Component Debug Center</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">Debug Information:</h2>
          <p className="text-blue-700 text-sm">
            This page tests the problematic components (Drivers, Trips, Fuel, Maintenance) 
            to identify what's causing them to crash.
          </p>
        </div>

        <div className="grid gap-4">
          {tests.map((test) => (
            <div key={test.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{test.name}</h3>
                <button
                  onClick={() => testComponent(test.name, test.test)}
                  disabled={activeTest === test.name}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {activeTest === test.name ? 'Testing...' : 'Test'}
                </button>
              </div>
              
              {testResults[test.name] && (
                <div className={`p-3 rounded-lg text-sm ${
                  testResults[test.name].success 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {testResults[test.name].success ? (
                    <div>
                      <span className="font-semibold">✅ Success:</span> {testResults[test.name].result}
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold">❌ Error:</span> {testResults[test.name].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Quick Navigation:</h3>
          <div className="flex flex-wrap gap-2">
            <a href="/dashboard/drivers" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Try Drivers
            </a>
            <a href="/dashboard/trips" className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
              Try Trips
            </a>
            <a href="/dashboard/fuel" className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
              Try Fuel
            </a>
            <a href="/dashboard/maintenance" className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
              Try Maintenance
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugComponents;
