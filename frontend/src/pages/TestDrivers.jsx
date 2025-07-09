import React, { useState, useEffect } from 'react';

const TestDrivers = () => {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🧪 TestDrivers: Component mounted');
    
    const testComponent = async () => {
      try {
        setStatus('Testing basic functionality...');
        console.log('🧪 TestDrivers: Basic test passed');
        
        setStatus('Testing API import...');
        const { driversAPI } = await import('../../services/api');
        console.log('🧪 TestDrivers: API import successful', driversAPI);
        
        setStatus('Testing API call...');
        const response = await driversAPI.getAll({ limit: 1 });
        console.log('🧪 TestDrivers: API call successful', response);
        
        setStatus('✅ All tests passed! Component should work normally.');
        
      } catch (err) {
        console.error('❌ TestDrivers: Error occurred:', err);
        setError(err.message || 'Unknown error');
        setStatus('❌ Test failed - see error below');
      }
    };
    
    testComponent();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 Test Drivers - Error Detected</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="font-semibold text-red-800 mb-2">Error Details:</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>This error is likely causing the Drivers page to crash.</p>
            <p>Check the browser console for more details.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🧪 Test Drivers Component</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h2 className="font-semibold text-blue-800 mb-2">Test Status:</h2>
          <p className="text-blue-700">{status}</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-2">Instructions:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• This is a simplified version of the Drivers component</li>
            <li>• It tests the basic functionality that might be causing crashes</li>
            <li>• Check the browser console for detailed logs</li>
            <li>• If this page works, the issue is in the full Drivers component</li>
            <li>• If this page crashes, the issue is more fundamental</li>
          </ul>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => window.location.href = '/dashboard/drivers'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Real Drivers Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDrivers;
