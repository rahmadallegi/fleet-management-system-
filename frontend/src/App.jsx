import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './components/Toast/ToastProvider';

// Layout Components
import Layout from './components/Layout/Layout';

// Page Components
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import Login from './pages/Auth/Login';
import Vehicles from './pages/Vehicles/Vehicles';
import Drivers from './pages/SafeDrivers'; // Temporary safe version
import Trips from './pages/Trips/Trips';
import Fuel from './pages/Fuel/Fuel';
import Maintenance from './pages/SafeMaintenance'; // Temporary safe version
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import DebugComponents from './pages/DebugComponents';

// Admin Pages
import UserManagement from './pages/Admin/UserManagement';

// User Pages
import VehicleRequest from './pages/User/VehicleRequest';

// Warehouse Pages
import VehicleTracking from './pages/Warehouse/VehicleTracking';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleProvider>
          <NotificationProvider>
            <ToastProvider>
              <Router>
            <div className="min-h-screen bg-gray-50">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />

              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="professional" element={<ProfessionalDashboard />} />
                  <Route path="debug" element={<DebugComponents />} />

                  {/* Admin Routes */}
                  <Route path="admin/users" element={<UserManagement />} />

                  {/* User Routes */}
                  <Route path="user/requests" element={<VehicleRequest />} />

                  {/* Warehouse Routes */}
                  <Route path="warehouse/tracking" element={<VehicleTracking />} />

                  {/* Common Routes */}
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="drivers" element={<Drivers />} />
                  <Route path="trips" element={<Trips />} />
                  <Route path="fuel" element={<Fuel />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </div>
              </Router>
            </ToastProvider>
          </NotificationProvider>
        </RoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
