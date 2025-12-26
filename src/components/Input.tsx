/**
 * Input component with consistent styling and validation
 */

import React from 'react';
import { FormField, FormFieldComponentProps } from './FormField';

export interface InputProps extends Omit<FormFieldComponentProps, 'children'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  error,
  disabled,
  id,
  ...fieldProps
}) => {
  const inputClasses = [
    'exbrain-form-input',
    error ? 'exbrain-form-input--error' : '',
  ].filter(Boolean).join(' ');

  return (
    <FormField
      {...fieldProps}
      id={id}
      error={error}
      disabled={disabled}
    >
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={[
          error ? `${id}-error` : '',
          fieldProps.help ? `${id}-help` : '',
        ].filter(Boolean).join(' ') || undefined}
      />
    </FormField>
  );
};


