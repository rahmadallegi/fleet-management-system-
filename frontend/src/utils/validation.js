// Professional Validation Utilities

export const validators = {
  required: (value, message = 'This field is required') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return message || `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return message || `Must be no more than ${max} characters long`;
    }
    return null;
  },

  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message;
    }
    return null;
  },

  number: (value, message = 'Must be a valid number') => {
    if (!value) return null;
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return message;
    }
    return null;
  },

  min: (min, message) => (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < min) {
      return message || `Must be at least ${min}`;
    }
    return null;
  },

  max: (max, message) => (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num > max) {
      return message || `Must be no more than ${max}`;
    }
    return null;
  },

  phoneNumber: (value, message = 'Please enter a valid phone number') => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanValue = value.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanValue)) {
      return message;
    }
    return null;
  },

  plateNumber: (value, message = 'Please enter a valid plate number') => {
    if (!value) return null;
    const plateRegex = /^[A-Z0-9]{2,3}-[A-Z0-9]{2,4}$/i;
    if (!plateRegex.test(value)) {
      return message;
    }
    return null;
  },

  employeeId: (value, message = 'Please enter a valid employee ID') => {
    if (!value) return null;
    const empIdRegex = /^EMP\d{3,6}$/i;
    if (!empIdRegex.test(value)) {
      return message;
    }
    return null;
  },

  date: (value, message = 'Please enter a valid date') => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return message;
    }
    return null;
  },

  futureDate: (value, message = 'Date must be in the future') => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    if (date <= now) {
      return message;
    }
    return null;
  },

  pastDate: (value, message = 'Date must be in the past') => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    if (date >= now) {
      return message;
    }
    return null;
  }
};

// Validation schema builder
export class ValidationSchema {
  constructor() {
    this.rules = {};
  }

  field(name) {
    this.currentField = name;
    this.rules[name] = [];
    return this;
  }

  required(message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.required);
    }
    return this;
  }

  email(message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.email);
    }
    return this;
  }

  minLength(min, message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.minLength(min, message));
    }
    return this;
  }

  maxLength(max, message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.maxLength(max, message));
    }
    return this;
  }

  pattern(regex, message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.pattern(regex, message));
    }
    return this;
  }

  number(message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.number);
    }
    return this;
  }

  min(min, message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.min(min, message));
    }
    return this;
  }

  max(max, message) {
    if (this.currentField) {
      this.rules[this.currentField].push(validators.max(max, message));
    }
    return this;
  }

  custom(validator) {
    if (this.currentField) {
      this.rules[this.currentField].push(validator);
    }
    return this;
  }

  validate(data) {
    const errors = {};
    
    for (const [field, validators] of Object.entries(this.rules)) {
      const value = data[field];
      
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Pre-built schemas for common forms
export const schemas = {
  user: new ValidationSchema()
    .field('name').required().minLength(2).maxLength(50)
    .field('email').required().email()
    .field('role').required(),

  vehicle: new ValidationSchema()
    .field('plateNumber').required().pattern(/^[A-Z0-9]{2,3}-[A-Z0-9]{2,4}$/i, 'Invalid plate number format (e.g., ABC-123)')
    .field('make').required().minLength(2).maxLength(30)
    .field('model').required().minLength(2).maxLength(30)
    .field('year').required().number().min(1900).max(new Date().getFullYear() + 1),

  driver: new ValidationSchema()
    .field('firstName').required().minLength(2).maxLength(30)
    .field('lastName').required().minLength(2).maxLength(30)
    .field('email').required().email()
    .field('employeeId').required().pattern(/^EMP\d{3,6}$/i, 'Employee ID must be in format EMP001'),

  trip: new ValidationSchema()
    .field('startLocation').required().minLength(3).maxLength(100)
    .field('endLocation').required().minLength(3).maxLength(100)
    .field('scheduledDate').required(),

  maintenance: new ValidationSchema()
    .field('title').required().minLength(3).maxLength(100)
    .field('vehicle').required()
    .field('scheduledDate').required()
    .field('estimatedCost').number().min(0),

  fuelLog: new ValidationSchema()
    .field('vehicle').required()
    .field('quantity').required().number().min(0.1).max(1000)
    .field('cost').required().number().min(0.01)
    .field('odometer').required().number().min(0)
};

// Utility function for real-time validation
export const validateField = (value, fieldName, schema) => {
  const tempData = { [fieldName]: value };
  const result = schema.validate(tempData);
  return result.errors[fieldName] || null;
};

// Utility function for form validation
export const validateForm = (data, schema) => {
  return schema.validate(data);
};

export default {
  validators,
  ValidationSchema,
  schemas,
  validateField,
  validateForm
};
