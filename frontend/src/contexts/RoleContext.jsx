import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // Define role permissions
  const rolePermissions = {
    admin: [
      'user_management',
      'vehicle_management', 
      'reporting',
      'settings',
      'view_all_requests',
      'approve_requests',
      'manage_warehouse'
    ],
    user: [
      'request_vehicle',
      'request_equipment',
      'request_maintenance',
      'view_own_requests'
    ],
    warehouse: [
      'track_vehicles',
      'track_equipment', 
      'manage_schedules',
      'update_status',
      'view_requests'
    ]
  };

  useEffect(() => {
    if (user) {
      // Get user role from user object or default to 'user'
      const role = user.role || 'user';
      setUserRole(role);
      setPermissions(rolePermissions[role] || []);
    } else {
      setUserRole(null);
      setPermissions([]);
    }
  }, [user]);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const isAdmin = () => userRole === 'admin';
  const isUser = () => userRole === 'user';
  const isWarehouse = () => userRole === 'warehouse';

  const getRoleName = () => {
    switch (userRole) {
      case 'admin': return 'Administrator';
      case 'user': return 'User';
      case 'warehouse': return 'Warehouse Manager';
      default: return 'Unknown';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'warehouse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const value = {
    userRole,
    permissions,
    hasPermission,
    isAdmin,
    isUser,
    isWarehouse,
    getRoleName,
    getRoleColor
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
