/**
 * GreetingForm component for collecting user input
 * Specialized component for the Hello project
 */

import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { sanitizeName, sanitizeTitle } from '../utils/sanitizer';

export interface GreetingFormData {
  name?: string; // Optional - can come from Auth0 or other sources
  title?: string;
}

export interface GreetingFormProps {
  onSubmit: (data: GreetingFormData) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const GreetingForm: React.FC<GreetingFormProps> = ({
  onSubmit,
  disabled = false,
  loading = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<GreetingFormData>({
    name: '',
    title: '',
  });
  const [errors, setErrors] = useState<Partial<GreetingFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<GreetingFormData> = {};

    // Name is optional - can come from Auth0 or other sources
    // Only validate if provided
    if (formData.name && !formData.name.trim()) {
      newErrors.name = 'Name cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Sanitize and trim inputs
    const sanitizedData: GreetingFormData = {
      ...(formData.name && { name: sanitizeName(formData.name.trim()) }),
      ...(formData.title && { title: sanitizeTitle(formData.title.trim()) }),
    };

    onSubmit(sanitizedData);
  };

  const handleInputChange = (field: keyof GreetingFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Form is valid if name is provided OR if name is optional (e.g., from Auth0)
  // For now, we'll allow submission even without name (backend will use Auth0 name)
  const isFormValid = true; // Always allow submission - name can come from Auth0
  const isDisabled = disabled || loading;

  return (
    <form onSubmit={handleSubmit} className={`exbrain-form ${className}`}>
      <Input
        id="name"
        label="Name"
        value={formData.name || ''}
        onChange={handleInputChange('name')}
        placeholder="Enter your name (optional if authenticated)"
        disabled={disabled || loading}
        error={errors.name}
        help="Optional - will use authenticated user name if available"
      />

      <Input
        id="title"
        label="Title"
        value={formData.title || ''}
        onChange={handleInputChange('title')}
        placeholder="Enter your title (optional)"
        disabled={disabled || loading}
        help="Optional title or position"
      />

      <Button
        type="submit"
        disabled={isDisabled}
        loading={loading}
        className="exbrain-button--primary"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
      
    </form>
  );
};


