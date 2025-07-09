import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { validateField } from '../../utils/validation';

export const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder,
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            {...props}
          >
            {children}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={`form-input resize-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            rows={4}
            {...props}
          />
        ) : (
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${type === 'password' ? 'pr-10' : ''}`}
            {...props}
          />
        )}

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Validation icon */}
        {value && !error && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-1 form-error">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Focus indicator */}
      {focused && !error && (
        <div className="text-xs text-blue-600">
          {placeholder && `e.g., ${placeholder}`}
        </div>
      )}
    </div>
  );
};

export const FormSection = ({ title, description, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export const FormGrid = ({ columns = 2, children, className = '' }) => (
  <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : `md:grid-cols-${columns}`} gap-4 ${className}`}>
    {children}
  </div>
);

export const FormActions = ({ children, align = 'right', className = '' }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'} space-x-3 pt-6 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

export const ProfessionalForm = ({ 
  onSubmit, 
  schema, 
  initialData = {}, 
  children, 
  className = '',
  validateOnChange = true,
  validateOnBlur = true 
}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation
    if (validateOnChange && schema && touched[name]) {
      const error = validateField(newValue, name, schema);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validation on blur
    if (validateOnBlur && schema) {
      const error = validateField(value, name, schema);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (schema) {
      const validation = schema.validate(data);
      setErrors(validation.errors);
      
      if (!validation.isValid) {
        // Mark all fields as touched to show errors
        const allTouched = {};
        Object.keys(schema.rules).forEach(field => {
          allTouched[field] = true;
        });
        setTouched(allTouched);
        return;
      }
    }

    onSubmit(data);
  };

  // Enhanced children with form context
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        data,
        errors,
        touched,
        onChange: handleChange,
        onBlur: handleBlur
      });
    }
    return child;
  });

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {enhancedChildren}
    </form>
  );
};

// Higher-order component for form fields
export const withFormField = (Component) => {
  return ({ data, errors, touched, onChange, onBlur, name, ...props }) => {
    return (
      <Component
        name={name}
        value={data?.[name] || ''}
        onChange={onChange}
        onBlur={onBlur}
        error={touched?.[name] ? errors?.[name] : null}
        {...props}
      />
    );
  };
};

// Pre-built form fields
export const TextField = withFormField(FormField);
export const SelectField = withFormField(({ children, ...props }) => (
  <FormField type="select" {...props}>
    {children}
  </FormField>
));
export const TextAreaField = withFormField(({ ...props }) => (
  <FormField type="textarea" {...props} />
));
export const PasswordField = withFormField(({ ...props }) => (
  <FormField type="password" {...props} />
));
export const EmailField = withFormField(({ ...props }) => (
  <FormField type="email" {...props} />
));
export const NumberField = withFormField(({ ...props }) => (
  <FormField type="number" {...props} />
));
export const DateField = withFormField(({ ...props }) => (
  <FormField type="date" {...props} />
));

export default ProfessionalForm;
