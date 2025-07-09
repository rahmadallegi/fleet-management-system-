# 🚗 Fleet Management System

A comprehensive, professional-grade fleet management system built with React, Node.js, Express, and MongoDB. This system provides complete vehicle fleet management with role-based access control, real-time analytics, and advanced reporting capabilities.

![Fleet Management System](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### 🔐 **Role-Based Authentication**
- **Administrator**: Full system access, user management, reporting
- **Regular User**: Vehicle requests, trip management, personal dashboard
- **Warehouse Manager**: Vehicle tracking, maintenance scheduling, inventory

### 📊 **Professional Dashboard**
- Real-time analytics and KPIs
- Interactive charts and visualizations
- Time-based filtering (24h, 7d, 30d, 90d)
- Export functionality (CSV, JSON)
- Responsive design

### 🚗 **Vehicle Management**
- Complete vehicle lifecycle tracking
- Maintenance scheduling and history
- Fuel consumption monitoring
- Real-time status updates
- Driver assignment management

### 👥 **Driver Management**
- Driver profiles with license tracking
- Availability status management
- Emergency contact information
- Performance monitoring
- Assignment history

### 🛣️ **Trip Management**
- Trip planning and scheduling
- Real-time trip tracking
- Route optimization
- Passenger management
- Trip history and reporting

### ⛽ **Fuel Tracking**
- Fuel consumption logging
- Efficiency calculations
- Cost tracking
- Station management
- Consumption analytics

### 🔧 **Maintenance System**
- Scheduled maintenance tracking
- Emergency repair management
- Service provider management
- Cost tracking
- Maintenance history

### 📝 **Request Management**
- Vehicle request system
- Equipment requests
- Approval workflows
- Status tracking
- Request history

### 🚨 **Alert System**
- Real-time notifications
- Maintenance reminders
- License expiry alerts
- Insurance notifications
- Custom alert rules

## 🛠️ Technology Stack

### **Frontend**
- **React 18.2.0** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **npm** - Package management

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB installed and running
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rahmadallegi/fleet-management-system.git
   cd fleet-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

4. **Set up the database**
   ```bash
   # Navigate to database directory
   cd ../database
   npm install
   npm run setup
   ```

5. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔑 Default Login Credentials

### Administrator
- **Email**: admin@fleet.com
- **Password**: admin123

### Regular User
- **Email**: user@fleet.com
- **Password**: user123

### Warehouse Manager
- **Email**: warehouse@fleet.com
- **Password**: warehouse123

## 📁 Project Structure

```
fleet-management-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── config/             # Configuration files
│   └── package.json
├── database/               # Database schemas and setup
│   ├── sql/               # SQL schemas
│   ├── mongodb/           # MongoDB seed data
│   └── setup.js           # Database setup script
├── docs/                  # Documentation
└── README.md
```

## 🎯 Key Features Showcase

### Professional Dashboard
- Real-time KPI monitoring
- Interactive charts and graphs
- Export capabilities
- Time-based filtering

### Role-Based Access Control
- Three distinct user roles
- Granular permissions
- Secure authentication
- Role-specific navigation

### Advanced Data Management
- CRUD operations for all entities
- Real-time data validation
- Professional forms
- Data export functionality

### Professional UI/UX
- Responsive design
- Loading states and animations
- Toast notifications
- Professional styling

## 📊 Database Schema

The system uses MongoDB with the following collections:
- **users** - System users and authentication
- **drivers** - Driver profiles and information
- **vehicles** - Vehicle fleet data
- **trips** - Trip records and scheduling
- **fuelLogs** - Fuel consumption tracking
- **maintenanceRecords** - Maintenance history
- **requests** - User requests and approvals
- **alerts** - System notifications

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

*[Additional endpoints for trips, fuel, maintenance, etc.]*

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend
npm run test
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm run start:prod
```

### Environment Variables
```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/fleet_management
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rahmad Allegi**
- GitHub: [@rahmadallegi](https://github.com/rahmadallegi)
- Email: rahmadallegi26@gmail.com

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the robust database
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors

## 📞 Support

If you have any questions or need support, please:
1. Check the [documentation](docs/)
2. Open an [issue](https://github.com/rahmadallegi/fleet-management-system/issues)
3. Contact the author

---

**⭐ If you find this project helpful, please give it a star!**
