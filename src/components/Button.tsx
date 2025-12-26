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
  const baseClasses = 'exbrain-button';
  const variantClass = `exbrain-button--${variant}`;
  const sizeClass = `exbrain-button--${size}`;
  const disabledClass = disabled ? 'exbrain-button--disabled' : '';

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
      {loading && <div className="exbrain-spinner exbrain-spinner--small" />}
      {children}
    </button>
  );
};


