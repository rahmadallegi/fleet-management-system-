import React from 'react';

const PlaceholderImage = ({ width = 400, height = 300, text = "Fleet Management", className = "" }) => {
  return (
    <div 
      className={`bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center rounded-lg ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="text-center">
        <div className="text-blue-600 text-lg font-semibold mb-2">{text}</div>
        <div className="text-blue-500 text-sm">Professional Fleet Solutions</div>
      </div>
    </div>
  );
};

export default PlaceholderImage;
