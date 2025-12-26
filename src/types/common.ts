/**
 * Common types and interfaces shared across React applications
 */

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  disabled?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
  loading?: boolean;
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

export interface StatusBannerProps extends BaseComponentProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  message: string;
  onRetry?: () => void;
  retryLoading?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  disabled?: boolean;
  validation?: Record<string, (value: any) => string | undefined>;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  closable?: boolean;
  backdrop?: boolean;
}

export interface ToastProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}


