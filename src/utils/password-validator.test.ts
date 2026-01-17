import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  validatePasswordSingleError,
  type PasswordPolicyConfig,
  type PasswordValidationResult,
} from './password-validator';

describe('password validator', () => {
  const defaultPolicy: PasswordPolicyConfig = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSymbol: true,
  };

  describe('validatePassword', () => {
    it('should validate a password that meets all requirements', () => {
      const result = validatePassword('Password123!', defaultPolicy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail when password is too short', () => {
      const result = validatePassword('Pass1!', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should fail when password lacks uppercase letter', () => {
      const result = validatePassword('password123!', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should fail when password lacks lowercase letter', () => {
      const result = validatePassword('PASSWORD123!', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should fail when password lacks number', () => {
      const result = validatePassword('Password!', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should fail when password lacks symbol', () => {
      const result = validatePassword('Password123', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one symbol (special character)');
    });

    it('should fail with multiple errors', () => {
      const result = validatePassword('pass', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one symbol (special character)');
    });

    it('should handle empty password', () => {
      const result = validatePassword('', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should handle very long password', () => {
      const longPassword = 'A'.repeat(1000) + 'a1!';
      const result = validatePassword(longPassword, defaultPolicy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate Unicode uppercase characters', () => {
      // Test with Unicode uppercase (e.g., Greek uppercase) and lowercase
      const result = validatePassword('ΑΒΓΔαβγδ123!', defaultPolicy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate Unicode lowercase characters', () => {
      // Test with Unicode lowercase (e.g., Greek lowercase)
      const result = validatePassword('αβγδ123!', defaultPolicy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should validate Unicode numbers', () => {
      // Test with Unicode numbers (e.g., Arabic-Indic digits)
      const result = validatePassword('Password٠١٢!', defaultPolicy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should work with custom policy (minLength only)', () => {
      const customPolicy: PasswordPolicyConfig = {
        minLength: 5,
        requireUppercase: false,
        requireLowercase: false,
        requireNumber: false,
        requireSymbol: false,
      };
      const result = validatePassword('hello', customPolicy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should work with custom policy (no requirements)', () => {
      const customPolicy: PasswordPolicyConfig = {
        minLength: 3,
        requireUppercase: false,
        requireLowercase: false,
        requireNumber: false,
        requireSymbol: false,
      };
      const result = validatePassword('abc', customPolicy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should work with custom policy (only uppercase required)', () => {
      const customPolicy: PasswordPolicyConfig = {
        minLength: 3,
        requireUppercase: true,
        requireLowercase: false,
        requireNumber: false,
        requireSymbol: false,
      };
      const result = validatePassword('ABC', customPolicy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('validatePasswordSingleError', () => {
    it('should return null for valid password', () => {
      const result = validatePasswordSingleError('Password123!', defaultPolicy);
      expect(result).toBeNull();
    });

    it('should return first error message for invalid password', () => {
      const result = validatePasswordSingleError('pass', defaultPolicy);
      expect(result).toBeTruthy();
      expect(result).toContain('Password must be');
    });

    it('should return error for empty password', () => {
      const result = validatePasswordSingleError('', defaultPolicy);
      expect(result).toBeTruthy();
      expect(result).toContain('Password must be at least');
    });
  });
});
