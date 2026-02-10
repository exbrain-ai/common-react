/**
 * EnvironmentBanner - Visual environment indicator
 *
 * Displays a compact, draggable bar at the top of the page showing the current environment.
 * Short height, centered by default; position can be moved horizontally (persisted in localStorage).
 *
 * Intended for client-only use (e.g. Next.js dynamic with ssr: false) since it relies on
 * window and hostname. Do not render during SSR to avoid hydration mismatch.
 *
 * @example
 * // In your app's root layout (client-only):
 * const EnvironmentBanner = dynamic(() => import('@company/common-react').then(m => ({ default: m.EnvironmentBanner })), { ssr: false });
 * <EnvironmentBanner version={version} healthUrl="/health" />
 *
 * // Or explicitly specify environment
 * <EnvironmentBanner environment="test" />
 *
 * // Hide in production
 * <EnvironmentBanner hideInProduction />
 */

"use client";

import React, { useRef, useEffect, useState } from 'react';

const ENV_RIBBON_STORAGE_KEY = 'env-ribbon-left';

export type Environment = 'local' | 'test' | 'dev' | 'ppe' | 'prod' | 'unknown';

interface EnvironmentBannerProps {
  /** Explicitly set the environment. If not provided, auto-detects from hostname. */
  environment?: Environment;
  /** Hide the banner in production environment (default: false) */
  hideInProduction?: boolean;
  /** Custom z-index for the banner (default: 999999) */
  zIndex?: number;
  /** Build version (semver or with build number) to show on the ribbon e.g. "1.2.3" or "1.0.2602051630". */
  version?: string;
  /** Optional health check URL (same-origin). When set, fetches and shows green ● (200) or red ✗ (non-200). */
  healthUrl?: string;
}

interface EnvironmentConfig {
  label: string;
  color: string;
  textColor: string;
}

const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  local: {
    label: 'LOCAL DEVELOPMENT',
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

  // Local development (including onebox: exbrain.onebox)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.onebox')
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
  version,
  healthUrl,
}) => {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const [healthStatus, setHealthStatus] = useState<'pending' | 'ok' | 'fail'>('pending');

  useEffect(() => {
    const el = ribbonRef.current;
    if (!el) return;

    const stored = localStorage.getItem(ENV_RIBBON_STORAGE_KEY);
    if (stored !== null) {
      const px = Number(stored);
      if (Number.isFinite(px)) {
        el.style.left = `${px}px`;
        el.style.transform = 'none';
      }
    }

    let dragging = false;
    let startX = 0;
    let startLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      startLeft = el.offsetLeft;
      el.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const maxLeft = window.innerWidth - el.offsetWidth;
      const newLeft = Math.max(0, Math.min(maxLeft, startLeft + dx));
      el.style.left = `${newLeft}px`;
      el.style.transform = 'none';
    };

    const onMouseUp = () => {
      if (dragging) {
        dragging = false;
        el.style.cursor = 'grab';
        localStorage.setItem(ENV_RIBBON_STORAGE_KEY, String(el.offsetLeft));
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!healthUrl) return;
    fetch(healthUrl)
      .then((res) => setHealthStatus(res.ok ? 'ok' : 'fail'))
      .catch(() => setHealthStatus('fail'));
  }, [healthUrl]);

  const detectedEnv = environment || detectEnvironment();

  // Hide in production if requested
  if (hideInProduction && detectedEnv === 'prod') {
    return null;
  }

  // Never show banner for 'local' unless explicitly set or on onebox (exbrain.onebox)
  if (
    detectedEnv === 'local' &&
    !environment &&
    typeof window !== 'undefined' &&
    !window.location.hostname.toLowerCase().endsWith('.onebox')
  ) {
    return null;
  }

  const config = ENVIRONMENT_CONFIGS[detectedEnv];
  const label = version ? `${config.label} | v${version}` : config.label;

  return (
    <div
      ref={ribbonRef}
      id="env-ribbon"
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'auto',
        maxWidth: '90%',
        zIndex,
        background: config.color,
        color: config.textColor,
        textAlign: 'center',
        padding: '6px 14px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        cursor: 'grab',
        borderRadius: '0 0 4px 4px',
      }}
    >
      {label}
      {healthUrl && healthStatus !== 'pending' && (
        <span
          style={{
            marginLeft: '4px',
            color: healthStatus === 'ok' ? '#22c55e' : '#ef4444',
          }}
        >
          {healthStatus === 'ok' ? ' ●' : ' ✗'}
        </span>
      )}
    </div>
  );
};

// Export the detection function for use in other contexts
export { detectEnvironment };
