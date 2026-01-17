/**
 * Password Policy Configuration
 * 
 * This configuration matches the server-side password policy in IAM service.
 * Each application must provide its own policy configuration.
 */
export interface PasswordPolicyConfig {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSymbol: boolean
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validates a password against the configured policy
 * 
 * This implementation matches the server-side validation logic in
 * `iam/internal/validation/password_validator.go` to ensure consistency
 * between client and server validation.
 * 
 * @param password - The password to validate
 * @param policy - Password policy configuration (required, no default)
 * @returns Validation result with isValid flag and array of error messages
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicyConfig
): PasswordValidationResult {
  const errors: string[] = []

  // Check minimum length
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`)
  }

  // Check for uppercase letter (Unicode-aware to match server-side unicode.IsUpper)
  if (policy.requireUppercase) {
    const hasUpper = /\p{Lu}/u.test(password)
    if (!hasUpper) {
      errors.push('Password must contain at least one uppercase letter')
    }
  }

  // Check for lowercase letter (Unicode-aware to match server-side unicode.IsLower)
  if (policy.requireLowercase) {
    const hasLower = /\p{Ll}/u.test(password)
    if (!hasLower) {
      errors.push('Password must contain at least one lowercase letter')
    }
  }

  // Check for number (Unicode-aware to match server-side unicode.IsNumber)
  if (policy.requireNumber) {
    const hasNumber = /\p{N}/u.test(password)
    if (!hasNumber) {
      errors.push('Password must contain at least one number')
    }
  }

  // Check for symbol (special character)
  // Symbol is any character that is not a letter, number, or whitespace
  // Unicode-aware to match server-side logic: !unicode.IsLetter && !unicode.IsNumber && !unicode.IsSpace
  if (policy.requireSymbol) {
    const hasSymbol = /[^\p{L}\p{N}\p{Zs}]/u.test(password)
    if (!hasSymbol) {
      errors.push('Password must contain at least one symbol (special character)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates a password and returns a single error message
 * Useful for displaying a single error message to the user
 * 
 * @param password - The password to validate
 * @param policy - Password policy configuration (required, no default)
 * @returns Single error message string, or null if valid
 */
export function validatePasswordSingleError(
  password: string,
  policy: PasswordPolicyConfig
): string | null {
  const result = validatePassword(password, policy)
  if (result.isValid) {
    return null
  }
  // Return first error message
  return result.errors.length > 0 ? (result.errors[0] || null) : null
}
