/**
 * Email validation utility
 *
 * Validates email addresses client-side before sending to the server.
 * Guards against ReDoS by enforcing a maximum input length before running the regex.
 *
 * RFC 5321 limits the full address to 254 characters.
 */

/** Maximum allowed email address length (RFC 5321). */
export const EMAIL_MAX_LENGTH = 254;

/**
 * Regex for basic structural email validation.
 * Checks for the presence of a local part, @-sign, domain, and TLD.
 * Full RFC 5321/5322 compliance is left to the server.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns true if the input is a structurally valid email address.
 *
 * Length is checked first (O(1)) to prevent ReDoS on pathological input.
 *
 * @param email - The string to validate.
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > EMAIL_MAX_LENGTH) return false;
  return EMAIL_REGEX.test(email);
}
