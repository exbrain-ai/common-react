/**
 * Button component with multiple variants and sizes.
 *
 * The default loading state renders a neutral inline SVG spinner that uses
 * `currentColor` so it inherits the button's text color and is not bound to
 * any app-specific stylesheet (features#271). Apps with a house spinner
 * pass it via the `loadingIndicator` prop.
 */

import React from 'react';
import { ButtonProps } from '../types/common';

/**
 * Default loading indicator. Inline SVG, `currentColor` for stroke so it
 * adapts to whatever text color the host app applies to the button. No
 * external CSS dependency.
 */
const DefaultLoadingIndicator: React.FC = () => (
  <svg
    aria-hidden="true"
    role="presentation"
    className="exbrain-button__spinner"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    style={{
      verticalAlign: 'middle',
      marginRight: '0.4em',
      animation: 'exbrain-button-spin 0.8s linear infinite',
    }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeOpacity="0.25"
    />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  loadingIndicator,
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
      aria-busy={loading || undefined}
    >
      {loading && (loadingIndicator ?? <DefaultLoadingIndicator />)}
      {children}
    </button>
  );
};

// Inject keyframes for the default spinner once. Apps that import this
// module in their bundle (or in SSR) get the animation defined exactly
// once — guarded by a window check + a flag.
if (typeof document !== 'undefined') {
  const FLAG = '__exbrain_button_spinner_keyframes_injected__';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (!w[FLAG]) {
    const style = document.createElement('style');
    style.setAttribute('data-exbrain-button-spinner', 'true');
    style.textContent =
      '@keyframes exbrain-button-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    w[FLAG] = true;
  }
}
