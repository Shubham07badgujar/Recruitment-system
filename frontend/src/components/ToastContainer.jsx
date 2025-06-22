import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Toast = ({ toast, onClose }) => {
  const { id, type, message } = toast;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [id, onClose]);
  
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    error: <XCircleIcon className="h-5 w-5 text-red-400" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />
  };
  
  const styles = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };
  
  const textStyles = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };
  
  return (
    <div className={`p-4 rounded-md border ${styles[type]} shadow-lg mb-3`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textStyles[type]}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            className={`inline-flex rounded-md ${textStyles[type]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            onClick={() => onClose(id)}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    message: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed right-0 top-0 z-50 p-4 sm:p-6 max-w-md w-full space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
      message: PropTypes.string.isRequired
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired
};

export default ToastContainer;
