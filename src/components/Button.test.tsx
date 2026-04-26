/**
 * Button — unit tests for features#271 fix.
 *
 * Verifies:
 *   - Default loading state renders the neutral inline SVG, NOT the legacy
 *     `exbrain-spinner` class.
 *   - `loadingIndicator` prop overrides the default spinner.
 *   - `aria-busy` is set when loading.
 *   - Disabled-while-loading semantics preserved.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Button } from './Button';

describe('Button — loading indicator (features#271)', () => {
  it('renders the default neutral SVG spinner when loading', () => {
    const { container } = render(<Button loading>Save</Button>);
    // Button must NOT carry the legacy app-bound class.
    expect(container.querySelector('.exbrain-spinner')).toBeNull();
    // Must render an SVG using currentColor (the default neutral indicator).
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the custom loadingIndicator when provided', () => {
    render(
      <Button loading loadingIndicator={<span data-testid="custom">…</span>}>
        Save
      </Button>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('does not render any indicator when not loading', () => {
    const { container } = render(<Button>Save</Button>);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('sets aria-busy when loading', () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).not.toHaveAttribute('aria-busy');
  });

  it('disables the button when loading even if disabled is false', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Button — variants', () => {
  it('applies variant and size classes', () => {
    const { container } = render(
      <Button variant="danger" size="large">
        Delete
      </Button>,
    );
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('exbrain-button--danger');
    expect(btn.className).toContain('exbrain-button--large');
  });

  it('appends caller-provided className', () => {
    const { container } = render(<Button className="my-extra">x</Button>);
    expect(container.querySelector('button')!.className).toContain('my-extra');
  });
});
