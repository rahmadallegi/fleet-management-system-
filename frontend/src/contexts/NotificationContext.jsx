import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Initialize with sample notifications
  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        title: 'Vehicle Maintenance Due',
        message: 'FL-001 (Ford Transit) is due for scheduled maintenance',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'warning',
        unread: true,
        category: 'maintenance'
      },
      {
        id: 2,
        title: 'Trip Completed',
        message: 'John Smith completed delivery to Downtown Office',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        type: 'success',
        unread: true,
        category: 'trips'
      },
      {
        id: 3,
        title: 'Fuel Level Low',
        message: 'FL-003 (Isuzu NPR) fuel level is below 20%',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        type: 'alert',
        unread: false,
        category: 'fuel'
      },
      {
        id: 4,
        title: 'New Driver Added',
        message: 'Sarah Johnson has been added to the system',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        type: 'info',
        unread: false,
        category: 'drivers'
      },
      {
        id: 5,
        title: 'Route Optimization',
        message: 'Weekly route optimization report is ready',
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: 'info',
        unread: false,
        category: 'reports'
      }
    ];

    setNotifications(sampleNotifications);
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      time: new Date(),
      unread: true,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => n.unread).length;
  };

  const getNotificationsByCategory = (category) => {
    return notifications.filter(n => n.category === category);
  };

  const formatTimeAgo = (time) => {
    const now = new Date();
    const diffInMs = now - time;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'alert': return '🚨';
      case 'info': return 'ℹ️';
      case 'maintenance': return '🔧';
      case 'fuel': return '⛽';
      case 'trips': return '🚛';
      case 'drivers': return '👤';
      case 'reports': return '📊';
      default: return '📢';
    }
  };

  // Auto-generate notifications based on system events
  const generateSystemNotifications = () => {
    // This would typically be called when certain events happen in the system
    // For demo purposes, we can add some random notifications
    const systemEvents = [
      {
        title: 'System Backup Complete',
        message: 'Daily system backup completed successfully',
        type: 'success',
        category: 'system'
      },
      {
        title: 'License Expiry Warning',
        message: 'Driver license for Mike Wilson expires in 30 days',
        type: 'warning',
        category: 'drivers'
      },
      {
        title: 'High Fuel Consumption',
        message: 'FL-002 showing higher than average fuel consumption',
        type: 'alert',
        category: 'fuel'
      }
    ];

    return systemEvents;
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount,
    getNotificationsByCategory,
    formatTimeAgo,
    getNotificationIcon,
    generateSystemNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
