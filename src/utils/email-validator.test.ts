import { describe, it, expect } from 'vitest';
import { validateEmail, EMAIL_MAX_LENGTH } from './email-validator';

describe('validateEmail', () => {
  it('returns true for a valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('returns true for an email with subdomains', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('returns true for an email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('returns false when missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('returns false when missing TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  it('returns false when containing spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });

  it('returns false for an address that exceeds EMAIL_MAX_LENGTH', () => {
    const longLocal = 'a'.repeat(EMAIL_MAX_LENGTH);
    expect(validateEmail(`${longLocal}@example.com`)).toBe(false);
  });

  it('returns false for an address exactly at EMAIL_MAX_LENGTH + 1', () => {
    // Build a string that is exactly EMAIL_MAX_LENGTH + 1 characters
    const suffix = '@b.co';
    const over = 'a'.repeat(EMAIL_MAX_LENGTH - suffix.length + 1) + suffix;
    expect(over.length).toBe(EMAIL_MAX_LENGTH + 1);
    expect(validateEmail(over)).toBe(false);
  });
});
