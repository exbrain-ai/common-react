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