/**
 * StatusBanner component for displaying status messages
 */

import React from 'react';
import { StatusBannerProps } from '../types/common';

export function StatusBanner({
  type = 'info',
  message,
  onRetry,
  retryLoading = false,
  retryLabel,
  retryLoadingLabel,
  dismissible = false,
  onDismiss,
  className = '',
}: StatusBannerProps): React.ReactElement {
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
        <span className="exbrain-status-banner-message">{String(message || '')}</span>
        <div className="exbrain-status-banner-actions">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={retryLoading}
              className="exbrain-button exbrain-button--small exbrain-button--secondary"
              aria-label="Retry action"
            >
              {retryLoading ? retryLoadingLabel : retryLabel}
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
}

