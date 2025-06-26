// Reusable button component to reduce code duplication
import { SpinnerIcon } from './Icons';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 disabled:bg-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-300',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500 disabled:bg-gray-50',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const finalClassName = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`;
  
  return (
    <button
      type={type}
      className={finalClassName}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;
