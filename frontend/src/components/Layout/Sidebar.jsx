import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  Fuel,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Shield,
  Package,
  ClipboardList,
  Truck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import toast from 'react-hot-toast';

// Role-based navigation
const getNavigationItems = (userRole) => {
  const commonItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  ];

  const adminItems = [
    { name: 'User Management', href: '/dashboard/admin/users', icon: Shield },
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
    { name: 'Drivers', href: '/dashboard/drivers', icon: Users },
    { name: 'Trips', href: '/dashboard/trips', icon: Route },
    { name: 'Fuel', href: '/dashboard/fuel', icon: Fuel },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const userItems = [
    { name: 'Vehicle Requests', href: '/dashboard/user/requests', icon: ClipboardList },
    { name: 'My Trips', href: '/dashboard/trips', icon: Route },
  ];

  const warehouseItems = [
    { name: 'Vehicle Tracking', href: '/dashboard/warehouse/tracking', icon: Truck },
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  ];

  switch (userRole) {
    case 'admin':
      return [...commonItems, ...adminItems];
    case 'user':
      return [...commonItems, ...userItems];
    case 'warehouse':
      return [...commonItems, ...warehouseItems];
    default:
      return commonItems;
  }
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { userRole, getRoleName, getRoleColor } = useRole();
  const navigate = useNavigate();

  const navigation = getNavigationItems(userRole);

  const handleNavigation = (href, name) => {
    try {
      console.log(`🧭 Sidebar: Navigating to ${name} (${href})`);
      navigate(href);
    } catch (error) {
      console.error(`❌ Sidebar: Navigation error to ${name}:`, error);
      toast.error(`Failed to navigate to ${name}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
        <h1 className="text-xl font-bold text-white">Fleet Manager</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
            <span className="text-sm font-medium text-white">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'Admin User'
              }
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'admin@fleet.com'}
            </p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getRoleColor()}`}>
              {getRoleName()}
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
