// src/hooks/useNotification.ts
import toast, { type ToastOptions } from 'react-hot-toast';
import { useUIStore } from '../stores/uiStore';
import type { ModalAlertConfig, AlertType, ModalAction } from '../types';

// Ορίζουμε τον τύπο για τις επιστρεφόμενες τιμές του hook
export interface UseNotificationReturn {
  toastSuccess: (message: string, options?: ToastOptions) => string;
  toastError: (message: string, options?: ToastOptions) => string;
  toastInfo: (message: string, options?: ToastOptions) => string;
  toastWarning: (message: string, options?: ToastOptions) => string;
  toastLoading: (message: string, options?: ToastOptions) => string;
  dismissToast: (toastId?: string) => void;
  showModalAlert: (config: { title: string; message: string; type: AlertType; actions?: ModalAction[] }) => void;
}

export const useNotification = (): UseNotificationReturn => {
  const openModalAlertFromStore = useUIStore((state) => state.openModalAlert);

  const toastSuccess = (message: string, options?: ToastOptions): string => {
    return toast.success(message, options);
  };

  const toastError = (message: string, options?: ToastOptions): string => {
    return toast.error(message, options);
  };

  const toastInfo = (message: string, options?: ToastOptions): string => {
    // Το react-hot-toast δεν έχει ξεχωριστό toast.info.
    // Χρησιμοποιούμε το γενικό toast() και το styling μπορεί να γίνει μέσω των global toastOptions ή custom toast.
    return toast(message, options);
  };

  const toastWarning = (message: string, options?: ToastOptions): string => {
    // Το react-hot-toast δεν έχει ξεχωριστό toast.warning.
    // Χρησιμοποιούμε το γενικό toast() και το styling μπορεί να γίνει μέσω των global toastOptions ή custom toast.
    return toast(message, options);
  };

  const toastLoading = (message: string, options?: ToastOptions): string => {
    return toast.loading(message, options);
  };

  const dismissToast = (toastId?: string): void => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss(); // Κλείνει όλα τα toasts αν δεν δοθεί ID
    }
  };

  const showModalAlert = (config: { title: string; message: string; type: AlertType; actions?: ModalAction[] }) => {
    // Παράμετροι που δέχεται το openModalAlert είναι Omit<ModalAlertConfig, 'isOpen' | 'onClose'>
    // το οποίο ταιριάζει με το config που λαμβάνουμε.
    openModalAlertFromStore(config);
  };

  return {
    toastSuccess,
    toastError,
    toastInfo,
    toastWarning,
    toastLoading,
    dismissToast,
    showModalAlert,
  };
};
