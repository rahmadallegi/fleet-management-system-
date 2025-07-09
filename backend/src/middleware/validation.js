import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Common validation rules
export const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  phone: body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
    
  name: (field) => body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${field} must contain only letters and spaces`),
    
  objectId: (field) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
    
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn(['asc', 'desc', '1', '-1'])
      .withMessage('Sort must be asc, desc, 1, or -1'),
    query('sortBy')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('SortBy field name is invalid')
  ]
};

// Authentication validation rules
export const authValidations = {
  register: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email,
    commonValidations.password,
    commonValidations.phone,
    body('role')
      .optional()
      .isIn(['admin', 'dispatcher', 'driver', 'viewer'])
      .withMessage('Invalid role specified'),
    handleValidationErrors
  ],
  
  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password.withMessage('New password must be at least 6 characters long'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
    handleValidationErrors
  ],
  
  forgotPassword: [
    commonValidations.email,
    handleValidationErrors
  ],
  
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// User validation rules
export const userValidations = {
  create: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email,
    commonValidations.password,
    commonValidations.phone,
    body('role')
      .isIn(['admin', 'dispatcher', 'driver', 'viewer'])
      .withMessage('Invalid role specified'),
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department cannot exceed 100 characters'),
    body('employeeId')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Employee ID must be between 3 and 50 characters'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.objectId('id'),
    commonValidations.name('firstName').optional(),
    commonValidations.name('lastName').optional(),
    commonValidations.email.optional(),
    commonValidations.phone,
    body('role')
      .optional()
      .isIn(['admin', 'dispatcher', 'driver', 'viewer'])
      .withMessage('Invalid role specified'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    handleValidationErrors
  ],
  
  getById: [
    commonValidations.objectId('id'),
    handleValidationErrors
  ]
};

// Vehicle validation rules
export const vehicleValidations = {
  create: [
    body('plateNumber')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Plate number must be between 3 and 20 characters')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('Plate number must contain only uppercase letters, numbers, and hyphens'),
    body('make')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Make must be between 2 and 50 characters'),
    body('model')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Model must be between 2 and 50 characters'),
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be between 1900 and next year'),
    body('type')
      .isIn(['car', 'truck', 'van', 'motorcycle', 'bus', 'trailer', 'other'])
      .withMessage('Invalid vehicle type'),
    body('fuelType')
      .isIn(['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'other'])
      .withMessage('Invalid fuel type'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'maintenance', 'repair', 'retired', 'sold'])
      .withMessage('Invalid vehicle status'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.objectId('id'),
    body('plateNumber')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Plate number must be between 3 and 20 characters'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'maintenance', 'repair', 'retired', 'sold'])
      .withMessage('Invalid vehicle status'),
    body('availability')
      .optional()
      .isIn(['available', 'in-use', 'maintenance', 'out-of-service'])
      .withMessage('Invalid availability status'),
    handleValidationErrors
  ]
};

// Driver validation rules
export const driverValidations = {
  create: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email,
    commonValidations.phone.withMessage('Primary phone is required'),
    body('dateOfBirth')
      .isISO8601()
      .withMessage('Please provide a valid date of birth')
      .custom((value) => {
        const age = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18 || age > 80) {
          throw new Error('Driver must be between 18 and 80 years old');
        }
        return true;
      }),
    body('employeeId')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Employee ID must be between 3 and 50 characters'),
    body('license.number')
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('License number must be between 5 and 50 characters'),
    body('license.class')
      .isIn(['A', 'B', 'C', 'CDL-A', 'CDL-B', 'CDL-C', 'M', 'other'])
      .withMessage('Invalid license class'),
    body('license.expiryDate')
      .isISO8601()
      .withMessage('Please provide a valid license expiry date')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('License expiry date must be in the future');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Trip validation rules
export const tripValidations = {
  create: [
    body('vehicle')
      .isMongoId()
      .withMessage('Invalid vehicle ID'),
    body('driver')
      .isMongoId()
      .withMessage('Invalid driver ID'),
    body('purpose')
      .isIn(['delivery', 'pickup', 'service', 'transport', 'maintenance', 'emergency', 'other'])
      .withMessage('Invalid trip purpose'),
    body('route.origin.address')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Origin address must be between 5 and 200 characters'),
    body('route.destination.address')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Destination address must be between 5 and 200 characters'),
    body('schedule.plannedStart')
      .isISO8601()
      .withMessage('Please provide a valid planned start time'),
    body('schedule.plannedEnd')
      .isISO8601()
      .withMessage('Please provide a valid planned end time')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.schedule.plannedStart)) {
          throw new Error('Planned end time must be after planned start time');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Fuel log validation rules
export const fuelValidations = {
  create: [
    body('vehicle')
      .isMongoId()
      .withMessage('Invalid vehicle ID'),
    body('driver')
      .isMongoId()
      .withMessage('Invalid driver ID'),
    body('fuelType')
      .isIn(['gasoline', 'diesel', 'premium', 'lpg', 'cng', 'electric', 'other'])
      .withMessage('Invalid fuel type'),
    body('quantity.amount')
      .isFloat({ min: 0.1, max: 1000 })
      .withMessage('Fuel quantity must be between 0.1 and 1000'),
    body('quantity.unit')
      .isIn(['liters', 'gallons', 'kwh'])
      .withMessage('Invalid fuel unit'),
    body('cost.pricePerUnit')
      .isFloat({ min: 0.01 })
      .withMessage('Price per unit must be greater than 0'),
    body('cost.totalAmount')
      .isFloat({ min: 0.01 })
      .withMessage('Total amount must be greater than 0'),
    body('odometer.reading')
      .isFloat({ min: 0 })
      .withMessage('Odometer reading cannot be negative'),
    handleValidationErrors
  ]
};

// Maintenance validation rules
export const maintenanceValidations = {
  create: [
    body('vehicle')
      .isMongoId()
      .withMessage('Invalid vehicle ID'),
    body('type')
      .isIn(['scheduled', 'preventive', 'corrective', 'emergency', 'inspection', 'oil-change', 'tire-rotation', 'brake-service', 'engine-service', 'transmission-service', 'electrical', 'bodywork', 'other'])
      .withMessage('Invalid maintenance type'),
    body('category')
      .isIn(['engine', 'transmission', 'brakes', 'tires', 'electrical', 'body', 'interior', 'other'])
      .withMessage('Invalid maintenance category'),
    body('scheduledDate')
      .isISO8601()
      .withMessage('Please provide a valid scheduled date'),
    body('workOrder.description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Work description must be between 10 and 1000 characters'),
    body('serviceProvider.name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Service provider name must be between 2 and 100 characters'),
    handleValidationErrors
  ]
};

export default {
  handleValidationErrors,
  commonValidations,
  authValidations,
  userValidations,
  vehicleValidations,
  driverValidations,
  tripValidations,
  fuelValidations,
  maintenanceValidations
};
