import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react';

// Simple Chart Components (without external dependencies)

export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'blue', 
  size = 'md',
  showValue = true,
  label,
  className = '' 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          {showValue && (
            <span className="font-medium text-gray-900">{value}/{max}</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showValue && !label && (
        <div className="text-xs text-gray-500 text-center">
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export const DonutChart = ({ 
  data, 
  size = 120, 
  strokeWidth = 8,
  className = '' 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
          
          cumulativePercentage += percentage;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
};

export const BarChart = ({ 
  data, 
  height = 200,
  color = '#3B82F6',
  className = '' 
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-end justify-between space-x-2" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40);
          
          return (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div className="text-xs font-medium text-gray-900">
                {item.value}
              </div>
              <div
                className="w-full rounded-t transition-all duration-500 ease-out"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: item.color || color,
                  minHeight: '4px'
                }}
              ></div>
              <div className="text-xs text-gray-600 text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const LineChart = ({ 
  data, 
  height = 200,
  color = '#3B82F6',
  strokeWidth = 2,
  showDots = true,
  className = '' 
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;
  
  const width = 300;
  const padding = 20;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + ((maxValue - item.value) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`space-y-4 ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          points={points}
          className="transition-all duration-500"
        />
        
        {/* Dots */}
        {showDots && data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + ((maxValue - item.value) / range) * chartHeight;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-600">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend,
  icon: Icon,
  color = 'blue',
  format = 'number',
  className = '' 
}) => {
  const formatValue = (val) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    if (format === 'decimal') return val.toFixed(1);
    return val.toLocaleString();
  };

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          </div>
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ChartContainer = ({ 
  title, 
  description,
  children, 
  actions,
  className = '' 
}) => (
  <div className={`card ${className}`}>
    <div className="card-header">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export const Legend = ({ data, className = '' }) => (
  <div className={`flex flex-wrap gap-4 ${className}`}>
    {data.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.color }}
        ></div>
        <span className="text-sm text-gray-600">{item.label}</span>
        {item.value !== undefined && (
          <span className="text-sm font-medium text-gray-900">
            {item.value}
          </span>
        )}
      </div>
    ))}
  </div>
);

export default {
  ProgressBar,
  DonutChart,
  BarChart,
  LineChart,
  MetricCard,
  ChartContainer,
  Legend
};
