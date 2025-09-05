import { toast } from 'sonner';

/**
 * Show dynamic toast notification
 * @param {'success'|'error'|'warning'|'info'} type 
 * @param {string} message 
 * @param {object} [options] 
 * @param {'top-left'|'top-right'|'bottom-left'|'bottom-right'|'top-center'|'bottom-center'} [options.position='top-right'] - Toast position
 * @param {number} [options.duration=4000] 
 * @param {boolean} [options.richColors=true]
 * @param {boolean} [options.closeButton=true] 
 */
export const showToast = (type, message, options = {}) => {
  const {
    position = 'top-right',
    duration = 4000,
    richColors = true,
    closeButton = false
  } = options;

  const toastConfig = {
    position,
    duration,
    closeButton,
    ...(richColors && { richColors: true })
  };

  switch (type) {
    case 'success':
      toast.success(message, toastConfig);
      break;
    case 'error':
      toast.error(message, toastConfig);
      break;
    case 'warning':
      toast.warning(message, toastConfig);
      break;
    case 'info':
      toast.info(message, toastConfig);
      break;
    default:
      toast(message, toastConfig);
  }
};

export const toastSuccess = (message, options) => 
  showToast('success', message, options);

export const toastError = (message, options) => 
  showToast('error', message, options);

export const toastWarning = (message, options) => 
  showToast('warning', message, options);

export const toastInfo = (message, options) => 
  showToast('info', message, options);