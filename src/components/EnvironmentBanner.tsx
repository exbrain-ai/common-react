/**
 * EnvironmentBanner - Visual environment indicator
 * 
 * Displays a fixed banner at the top of the page showing the current environment.
 * Helps prevent confusion when working across multiple environments (test, dev, ppe, prod).
 * 
 * @example
 * // In your app's root layout:
 * import { EnvironmentBanner } from '@company/common-react';
 * 
 * // Auto-detect from hostname (recommended)
 * <EnvironmentBanner />
 * 
 * // Or explicitly specify environment
 * <EnvironmentBanner environment="test" />
 * 
 * // Hide in production
 * <EnvironmentBanner hideInProduction />
 */

import React from 'react';

export type Environment = 'local' | 'test' | 'dev' | 'ppe' | 'prod' | 'unknown';

interface EnvironmentBannerProps {
  /** Explicitly set the environment. If not provided, auto-detects from hostname. */
  environment?: Environment;
  /** Hide the banner in production environment (default: false) */
  hideInProduction?: boolean;
  /** Custom z-index for the banner (default: 999999) */
  zIndex?: number;
}

interface EnvironmentConfig {
  label: string;
  color: string;
  textColor: string;
}

const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  local: {
    label: '🏠 LOCAL',
    color: '#059669', // green-600
    textColor: 'white',
  },
  test: {
    label: '🧪 TEST',
    color: '#60a5fa', // blue-400, lighter than blue-500 to avoid confusion with local green
    textColor: 'white',
  },
  dev: {
    label: '🔧 DEV',
    color: '#3b82f6', // blue-500
    textColor: 'white',
  },
  ppe: {
    label: '⚠️ PPE (Pre-Production)',
    color: '#eab308', // yellow-500
    textColor: 'black',
  },
  prod: {
    label: '🔴 PRODUCTION',
    color: '#dc2626', // red-600
    textColor: 'white',
  },
  unknown: {
    label: '❓ UNKNOWN',
    color: '#6b7280', // gray-500
    textColor: 'white',
  },
};

/**
 * Detects environment from hostname.
 * 
 * Patterns:
 * - localhost / 127.0.0.1 / .local → local
 * - test.* / *-test.* → test
 * - dev.* / *-dev.* → dev
 * - ppe.* / *-ppe.* / staging.* → ppe
 * - prod.* / *-prod.* / www.* / no prefix → prod
 */
function detectEnvironment(): Environment {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const hostname = window.location.hostname.toLowerCase();

  // Local development
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost')
  ) {
    return 'local';
  }

  // Test environment
  if (
    hostname.startsWith('test.') ||
    hostname.includes('-test.') ||
    hostname.includes('.test.')
  ) {
    return 'test';
  }

  // Dev environment
  if (
    hostname.startsWith('dev.') ||
    hostname.includes('-dev.') ||
    hostname.includes('.dev.')
  ) {
    return 'dev';
  }

  // PPE / Staging environment
  if (
    hostname.startsWith('ppe.') ||
    hostname.includes('-ppe.') ||
    hostname.includes('.ppe.') ||
    hostname.startsWith('staging.') ||
    hostname.includes('-staging.')
  ) {
    return 'ppe';
  }

  // Production (no specific prefix, or prod prefix)
  if (
    hostname.startsWith('prod.') ||
    hostname.includes('-prod.') ||
    hostname.startsWith('www.') ||
    // No environment prefix usually means production
    !hostname.match(/^(test|dev|ppe|staging|local)\./)
  ) {
    return 'prod';
  }

  return 'unknown';
}

export const EnvironmentBanner: React.FC<EnvironmentBannerProps> = ({
  environment,
  hideInProduction = false,
  zIndex = 999999,
}) => {
  const detectedEnv = environment || detectEnvironment();
  
  // Hide in production if requested
  if (hideInProduction && detectedEnv === 'prod') {
    return null;
  }

  // Never show banner for 'local' unless explicitly set
  // This prevents annoying banners during local development
  if (detectedEnv === 'local' && !environment) {
    return null;
  }

  const config = ENVIRONMENT_CONFIGS[detectedEnv];

  return (
    <>
      <div
        id="env-ribbon"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex,
          background: config.color,
          color: config.textColor,
          textAlign: 'center',
          padding: '4px 0',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '1px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {config.label}
      </div>
      {/* Spacer to push content down */}
      <div style={{ height: '28px' }} />
    </>
  );
};

// Export the detection function for use in other contexts
export { detectEnvironment };
