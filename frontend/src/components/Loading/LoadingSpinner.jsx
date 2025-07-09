import React from 'react';
import { Loader2, Car, Users, Route, Fuel, Wrench } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
  );
};

export const LoadingCard = ({ title = 'Loading...', description }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center space-x-3">
      <LoadingSpinner size="md" />
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

export const LoadingTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`h-4 bg-gray-200 rounded animate-pulse ${
                colIndex === 0 ? 'w-1/4' : colIndex === columns - 1 ? 'w-1/6' : 'w-1/3'
              }`}
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 100}ms` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const LoadingDashboard = () => (
  <div className="p-6 space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
      </div>
      <div className="flex space-x-3">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
      </div>
    </div>

    {/* KPI Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const LoadingPage = ({ 
  title = 'Loading...', 
  description = 'Please wait while we fetch your data',
  icon: Icon = Car 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="xl" />
        </div>
        <Icon className="h-24 w-24 text-gray-300 mx-auto" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
      <div className="mt-4 flex justify-center space-x-2">
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export const LoadingButton = ({ 
  loading = false, 
  children, 
  className = '', 
  disabled = false,
  ...props 
}) => (
  <button
    className={`flex items-center justify-center space-x-2 ${className} ${
      loading || disabled ? 'opacity-75 cursor-not-allowed' : ''
    }`}
    disabled={loading || disabled}
    {...props}
  >
    {loading && <LoadingSpinner size="sm" color="white" />}
    <span>{children}</span>
  </button>
);

export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 rounded animate-pulse ${
          index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      ></div>
    ))}
  </div>
);

export const LoadingModal = ({ isOpen, title = 'Processing...' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
