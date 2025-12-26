/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Form validation utilities
 * @eslint-disable-next-line @typescript-eslint/no-explicit-any
 */

export const validators = {
  /**
   * Validate required field
   * @param value - The value to validate
   */
  required: (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "This field is required";
    }
    return "";
  },

  /**
   * Validate email
   */
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  },

  /**
   * Validate minimum length
   */
  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return "";
  },

  /**
   * Validate maximum length
   */
  maxLength: (max: number) => (value: string) => {
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return "";
  },

  /**
   * Validate minimum number
   */
  min: (min: number) => (value: number) => {
    if (value < min) {
      return `Must be at least ${min}`;
    }
    return "";
  },

  /**
   * Validate maximum number
   */
  max: (max: number) => (value: number) => {
    if (value > max) {
      return `Must be no more than ${max}`;
    }
    return "";
  },

  /**
   * Validate number
   */
  number: (value: any) => {
    if (isNaN(value) || value === "") {
      return "Must be a valid number";
    }
    return "";
  },

  /**
   * Validate password strength
   */
  passwordStrength: (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain an uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain a lowercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain a number";
    }
    return "";
  },

  /**
   * Validate URL
   */
  url: (value: string) => {
    try {
      new URL(value);
      return "";
    } catch {
      return "Please enter a valid URL";
    }
  },

  /**
   * Validate wallet address (Ethereum format)
   */
  walletAddress: (value: string) => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(value)) {
      return "Please enter a valid wallet address";
    }
    return "";
  },
};

/**
 * Compose multiple validators
 */
export function composeValidators(...validatorFns: ((value: any) => string)[]) {
  return (value: any) => {
    for (const validator of validatorFns) {
      const error = validator(value);
      if (error) return error;
    }
    return "";
  };
}

/**
 * Create a custom validator
 */
export function createValidator(
  validator: (value: any) => boolean,
  message: string
) {
  return (value: any) => {
    return validator(value) ? "" : message;
  };
}

/**
 * Async validator factory
 */
export function createAsyncValidator(
  validator: (value: any) => Promise<boolean>,
  message: string
) {
  return async (value: any) => {
    const isValid = await validator(value);
    return isValid ? "" : message;
  };
}

/**
 * Form field configuration
 */
export interface FieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  validators?: ((value: any) => string | Promise<string>)[];
  required?: boolean;
}

/**
 * Form configuration
 */
export interface FormConfig {
  fields: FieldConfig[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
}

/**
 * Validate all form fields
 */
export async function validateForm(
  values: Record<string, any>,
  config: FieldConfig[]
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  for (const field of config) {
    const value = values[field.name];
    const validators_list = field.validators || [];

    if (field.required && !value) {
      errors[field.name] = "This field is required";
      continue;
    }

    for (const validator of validators_list) {
      const error = await validator(value);
      if (error) {
        errors[field.name] = error;
        break;
      }
    }
  }

  return errors;
}

/**
 * Sanitize form values
 */
export function sanitizeFormValues(
  values: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Format form errors for display
 */
export function formatFormErrors(errors: Record<string, string>): string[] {
  return Object.values(errors).filter((error) => error);
}

/**
 * Check if form has errors
 */
export function hasFormErrors(errors: Record<string, string>): boolean {
  return Object.values(errors).some((error) => error);
}

/**
 * Reset form values to initial state
 */
export function getInitialFormValues(
  config: FieldConfig[]
): Record<string, any> {
  return config.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Create form submission handler
 */
export function createSubmitHandler(
  config: FormConfig,
  values: Record<string, any>
) {
  return async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = await validateForm(values, config.fields);

    if (hasFormErrors(errors)) {
      config.onError?.(errors);
      return;
    }

    const sanitized = sanitizeFormValues(values);
    await config.onSubmit(sanitized);
  };
}
