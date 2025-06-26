import { SpinnerIcon } from './Icons';

const LoadingSpinner = ({ size = 'md', color = 'blue', fullScreen = false }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  // Color classes
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };
  
  const spinnerClass = `animate-spin ${sizeClasses[size]} ${colorClasses[color]}`;
  
  const spinner = <SpinnerIcon className={spinnerClass} />;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default LoadingSpinner;
