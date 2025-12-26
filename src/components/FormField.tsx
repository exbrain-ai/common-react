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
    <div className="exbrain-form-group">
      <label
        htmlFor={id}
        id={labelId}
        className={`exbrain-form-label ${required ? 'exbrain-form-label--required' : ''}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <div
          id={actualErrorId}
          className="exbrain-form-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      {help && !error && (
        <div id={actualHelpId} className="exbrain-form-help">
          {help}
        </div>
      )}
    </div>
  );
};


