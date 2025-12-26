/**
 * StatusBanner component for displaying status messages
 */

import React from 'react';
import { StatusBannerProps } from '../types/common';

export const StatusBanner: React.FC<StatusBannerProps> = ({
  type = 'info',
  message,
  onRetry,
  retryLoading = false,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`exbrain-status-banner exbrain-status-banner--${type} ${className}`} role="alert">
      <div className="exbrain-status-banner-content">
        <span className="exbrain-status-banner-icon" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="exbrain-status-banner-message">{message}</span>
        <div className="exbrain-status-banner-actions">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={retryLoading}
              className="exbrain-button exbrain-button--small exbrain-button--secondary"
              aria-label="Retry action"
            >
              {retryLoading ? 'Retrying...' : 'Retry'}
            </button>
          )}
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="exbrain-button exbrain-button--small exbrain-button--secondary"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


