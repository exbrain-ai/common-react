/**
 * Button component with multiple variants and sizes
 */

import React from 'react';
import { ButtonProps } from '../types/common';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  children,
}) => {
  const baseClasses = 'medbai-button';
  const variantClass = `medbai-button--${variant}`;
  const sizeClass = `medbai-button--${size}`;
  const disabledClass = disabled ? 'medbai-button--disabled' : '';

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    disabledClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <div className="medbai-spinner medbai-spinner--small" />}
      {children}
    </button>
  );
};


