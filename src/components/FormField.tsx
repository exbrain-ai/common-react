/**
 * FormField component for consistent form input styling
 */

import React from 'react';
import { FormFieldProps } from '../types/common';

export interface FormFieldComponentProps extends FormFieldProps {
  id: string;
  children: React.ReactNode;
  errorId?: string;
  helpId?: string;
}

export const FormField: React.FC<FormFieldComponentProps> = ({
  label,
  required = false,
  error,
  help,
  disabled = false,
  id,
  children,
  errorId,
  helpId,
}) => {
  const labelId = `${id}-label`;
  const actualErrorId = errorId || `${id}-error`;
  const actualHelpId = helpId || `${id}-help`;

  return (
    <div className="medbai-form-group">
      <label
        htmlFor={id}
        id={labelId}
        className={`medbai-form-label ${required ? 'medbai-form-label--required' : ''}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <div
          id={actualErrorId}
          className="medbai-form-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      {help && !error && (
        <div id={actualHelpId} className="medbai-form-help">
          {help}
        </div>
      )}
    </div>
  );
};


