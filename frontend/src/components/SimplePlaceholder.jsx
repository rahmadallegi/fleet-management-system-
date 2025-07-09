import React from 'react';

const SimplePlaceholder = ({ title, description, icon: Icon }) => {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          {Icon && <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-800 mb-2">🚧 Temporary Placeholder</h2>
          <p className="text-sm text-yellow-700">
            This is a simplified version of the {title} page to prevent crashes.
            The full functionality is being debugged.
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">What's Working:</h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>✅ Page loads without crashing</li>
            <li>✅ Navigation works properly</li>
            <li>✅ Layout and styling are intact</li>
            <li>✅ Error boundaries are active</li>
          </ul>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>This placeholder will be replaced with the full component once the issue is resolved.</p>
        </div>
      </div>
    </div>
  );
};

export default SimplePlaceholder;
