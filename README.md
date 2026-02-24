# @exbrain/common-react

Shared React components, utilities, and styles for React projects.

## Overview

This package provides a comprehensive design system and shared components for React applications. It includes:

- **Design System**: CSS variables, base styles, and component styles
- **Reusable Components**: Button, Input, Table, StatusBanner, and more
- **Utilities**: Logging, sanitization, and common helper functions
- **TypeScript Support**: Full type definitions for all components and utilities

## Installation

```bash
npm install @exbrain/common-react
```

## Usage

### Basic Setup

Import the main stylesheet in your application:

```tsx
import '@exbrain/common-react/dist/common-react.css';
```

### Using Components

```tsx
import React from 'react';
import { Button, Input, StatusBanner, Table } from '@exbrain/common-react';

function MyComponent() {
  return (
    <div>
      <StatusBanner type="info" message="Welcome!" />
      <Input
        id="name"
        label="Name"
        value={name}
        onChange={setName}
        required
      />
      <Button variant="primary" onClick={handleClick}>
        Submit
      </Button>
    </div>
  );
}
```

### Request ID (correlation across gateway, IAM, backends)

Use request ID so every request and response can be correlated in logs. **Adopt in all apps** (Hello and others).

**Client-side:** use `getRequestIdHeader()` for OpenAPI/default headers and `fetchWithRequestId()` for direct `fetch`:

```tsx
import { getRequestIdHeader, fetchWithRequestId } from '@exbrain/common-react';

// OpenAPI client: set default headers
OpenAPI.HEADERS = async () => getRequestIdHeader();

// Direct fetch
const res = await fetchWithRequestId('/api/greetings', { method: 'POST', body: JSON.stringify(data) });
```

**Server-side (Next.js API routes):** use `@exbrain/common-react/server` to forward request ID when proxying:

```tsx
import { getOrCreateRequestId, fetchWithTimeout } from '@exbrain/common-react/server';

const requestId = getOrCreateRequestId(request.headers);
const response = await fetchWithTimeout(iamUrl, { requestId, method: 'GET' });
// Echo in response: headers: { 'X-Request-ID': requestId }
```

See **docs/REQUEST_ID.md** in common-go for the full flow (Go services, gateway, React).

### Using Utilities

```tsx
import { logger, sanitizeName, sanitizeTitle } from '@exbrain/common-react';

// Logging
logger.info('User action', { userId: 123, action: 'login' });

// Sanitization
const cleanName = sanitizeName(userInput);
const cleanTitle = sanitizeTitle(userTitle);
```

## Design System

### CSS Variables

The design system uses CSS custom properties for consistent theming:

```css
:root {
  --exbrain-primary: #007bff;
  --exbrain-secondary: #6c757d;
  --exbrain-success: #28a745;
  --exbrain-warning: #ffc107;
  --exbrain-danger: #dc3545;
  /* ... and many more */
}
```

### Color Palette

- **Primary**: Blue (#007bff)
- **Secondary**: Gray (#6c757d)
- **Success**: Green (#28a745)
- **Warning**: Yellow (#ffc107)
- **Danger**: Red (#dc3545)
- **Info**: Cyan (#17a2b8)

### Typography

- **Font Family**: System fonts (San Francisco, Segoe UI, etc.)
- **Font Sizes**: 12px to 36px scale
- **Font Weights**: 300 to 700

## Components

### Button

```tsx
<Button variant="primary" size="medium" onClick={handleClick}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'warning'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean
- `loading`: boolean

### Input

```tsx
<Input
  id="email"
  label="Email Address"
  type="email"
  value={email}
  onChange={setEmail}
  required
  error={emailError}
  help="We'll never share your email"
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `label`: string
- `required`: boolean
- `error`: string
- `help`: string

### StatusBanner

```tsx
<StatusBanner
  type="warning"
  message="Service temporarily unavailable"
  onRetry={handleRetry}
  retryLoading={isRetrying}
/>
```

**Props:**
- `type`: 'info' | 'warning' | 'error' | 'success'
- `message`: string
- `onRetry`: () => void
- `retryLoading`: boolean
- `dismissible`: boolean

### Table

```tsx
<Table
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (value) => value.toUpperCase() }
  ]}
  emptyMessage="No users found"
  sortable
/>
```

## Specialized Components

### GreetingForm

A specialized form component for the Hello project:

```tsx
<GreetingForm
  onSubmit={handleSubmit}
  loading={isSubmitting}
  disabled={isDisabled}
/>
```

### StatsTable

A specialized table for displaying user statistics:

```tsx
<StatsTable
  data={userStats}
  className="my-stats-table"
/>
```

## Utilities

### Logger

Structured logging utility:

```tsx
import { logger } from '@exbrain/common-react';

logger.debug('Debug message', { context: 'data' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error: 'details' });
```

### Sanitization

Input sanitization utilities:

```tsx
import { sanitizeName, sanitizeTitle, sanitizeString, sanitizeHTML } from '@exbrain/common-react';

const cleanName = sanitizeName(userInput);
const cleanTitle = sanitizeTitle(userTitle);
const cleanString = sanitizeString(anyInput);
const cleanHTML = sanitizeHTML(htmlContent);
```

### Path Utilities

Path utilities for handling basePath in Next.js applications:

```tsx
import { getBasePath, apiUrl, appUrl, withoutBasePath, hasBasePath, getDashboardHomePath } from '@exbrain/common-react';

// Get basePath from environment variable
const basePath = getBasePath(); // Returns '/hello' if NEXT_PUBLIC_BASE_PATH is set

// Add basePath to API route paths (for client-side fetch calls)
const apiEndpoint = apiUrl('/api/auth/signup'); // Returns '/hello/api/auth/signup' if basePath is '/hello'

// Add basePath to app route paths (for page navigation)
const dashboardUrl = appUrl('/dashboard/home'); // Returns '/hello/dashboard/home' if basePath is '/hello'

// Remove basePath from a path
const normalizedPath = withoutBasePath('/hello/dashboard/home'); // Returns '/dashboard/home' if basePath is '/hello'

// Check if path starts with basePath
const hasBase = hasBasePath('/hello/dashboard'); // Returns true if basePath is '/hello'

// Get default dashboard home path (with basePath)
const homePath = getDashboardHomePath(); // Returns '/hello/dashboard/home' if basePath is '/hello'
```

**Usage Notes:**
- Works in both server-side and client-side contexts (automatically detects `typeof window`)
- Handles empty basePath (host development mode - returns path as-is)
- Normalizes paths (ensures leading slash)
- Handles edge cases: empty strings return `/`, malformed paths are normalized

### Password Validator

Password validation utility that matches server-side validation logic:

```tsx
import { validatePassword, validatePasswordSingleError, type PasswordPolicyConfig } from '@exbrain/common-react';

// Define your app-specific password policy
const passwordPolicy: PasswordPolicyConfig = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
};

// Validate password and get detailed errors
const result = validatePassword('Password123!', passwordPolicy);
if (result.isValid) {
  console.log('Password is valid');
} else {
  console.log('Password errors:', result.errors);
  // ['Password must be at least 8 characters long', ...]
}

// Validate password and get single error message (useful for UI display)
const singleError = validatePasswordSingleError('weak', passwordPolicy);
if (singleError) {
  console.log('Password error:', singleError);
  // 'Password must be at least 8 characters long'
}
```

**Features:**
- Unicode-aware validation (matches server-side Go `unicode` package logic)
- Policy is a required parameter (no default policy in common-react - each app must provide its own)
- Returns detailed errors or single error message
- Supports custom policy configurations

### Error Handling Utilities

Authentication error mapping utilities:

```tsx
import { mapAuthError, extractAuthError, type AuthError } from '@exbrain/common-react';

// Map IAM Service error codes to user-friendly messages
const userMessage = mapAuthError('invalid_credentials');
// Returns: 'Invalid email or password. Please check your credentials and try again.'

// Map unknown error code with custom default message
const customMessage = mapAuthError('unknown_code', 'Custom error message');
// Returns: 'Custom error message'

// Extract error from API response
const apiResponse = {
  error: {
    code: 'csrf_token_invalid',
    message: 'CSRF token is invalid',
  },
};
const extracted = extractAuthError(apiResponse);
// Returns: { code: 'csrf_token_invalid', message: 'Security token expired. Please refresh the page and try again.' }

// Handle string error format
const stringError = extractAuthError({ error: 'Network error' });
// Returns: { code: 'unknown', message: 'Network error' }
```

**Supported Error Codes:**
- Authentication: `invalid_credentials`, `invalid_email`, `invalid_password`
- Signup: `user_already_exists`, `email_already_registered`
- CSRF: `csrf_token_invalid`, `csrf_token_missing`, `csrf_token_expired`
- Rate limiting: `rate_limit_exceeded`
- Account: `account_locked`, `account_suspended`
- Service: `service_unavailable`, `internal_error`
- Network: `network_error`, `timeout`

### Auth Event Logging

Structured logging for authentication events:

```tsx
import { logAuthEvent, getClientIP, getUserAgent, getBrowserUserAgent, type AuthEventContext } from '@exbrain/common-react';

// Log authentication event (appName is REQUIRED)
const context: AuthEventContext = {
  eventType: 'login_success',
  appName: 'hello', // REQUIRED - identifies the application
  userId: 'user-123', // Internal user ID (UUID) - safe to log
  result: 'success',
  endpoint: '/auth/password-login',
  requestId: 'req-123',
};
logAuthEvent(context);

// Log failure event
logAuthEvent({
  eventType: 'login_failure',
  appName: 'hello', // REQUIRED
  userId: 'user-123',
  result: 'failure',
  errorCode: 'invalid_credentials',
  errorMessage: 'Invalid credentials',
  endpoint: '/auth/password-login',
});

// Get client IP from headers (server-side)
const headers = new Headers();
headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');
const ip = getClientIP(headers); // Returns '192.168.1.1'

// Get user agent from headers (server-side)
const userAgent = getUserAgent(headers); // Returns user agent string

// Get browser user agent (client-side only)
const browserUA = getBrowserUserAgent(); // Returns window.navigator.userAgent
```

**Features:**
- Structured JSON logging (compatible with Loki)
- `appName` parameter is REQUIRED (not optional) - ensures all logs can be identified by application
- Never logs PII (email, IP, userAgent) - only logs user_id (internal UUID)
- Supports both server-side (Headers) and client-side (Record) usage
- Automatic log level selection (error for failures, info for successes)

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
npm run test:ui
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## TypeScript

This package is written in TypeScript and provides full type definitions. All components and utilities are fully typed.

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT