export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class UsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageLimitError';
  }
}

export class WebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const ErrorMessages = {
  USAGE_LIMIT_EXCEEDED: 'Usage limit exceeded',
  SUBSCRIPTION_ALREADY_EXISTS: 'User already has an active subscription',
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  INVALID_SUBSCRIPTION_STATUS: 'Invalid subscription status',
  PAYMENT_FAILED: 'Payment failed',
  WEBHOOK_SIGNATURE_INVALID: 'Invalid webhook signature',
  DATABASE_OPERATION_FAILED: 'Database operation failed',
  USER_NOT_FOUND: 'User not found',
  INVALID_API_KEY: 'Invalid API key',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
  INVALID_REQUEST_PARAMETERS: 'Missing or invalid request parameters',
  SUBSCRIPTION_CREATION_FAILED: 'Failed to create subscription',
  PAYMENT_INTENT_CREATION_FAILED: 'Failed to create payment intent',
  INVALID_PAYMENT_METHOD: 'Invalid payment method provided'
} as const;

export type ErrorCode = keyof typeof ErrorMessages;

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
}

export function createErrorResponse(code: ErrorCode, details?: any): ErrorResponse {
  return {
    code,
    message: ErrorMessages[code],
    details
  };
}

export function isSubscriptionError(error: any): error is SubscriptionError {
  return error instanceof SubscriptionError;
}

export function isPaymentError(error: any): error is PaymentError {
  return error instanceof PaymentError;
}

export function isUsageLimitError(error: any): error is UsageLimitError {
  return error instanceof UsageLimitError;
}

export function handleApiError(error: any): ErrorResponse {
  if (isSubscriptionError(error)) {
    return createErrorResponse('SUBSCRIPTION_NOT_FOUND', error.message);
  }
  
  if (isPaymentError(error)) {
    return createErrorResponse('PAYMENT_FAILED', error.message);
  }
  
  if (isUsageLimitError(error)) {
    return createErrorResponse('USAGE_LIMIT_EXCEEDED', error.message);
  }

  // Handle network errors
  if (error?.message?.includes('network')) {
    return createErrorResponse('NETWORK_ERROR', error.message);
  }

  // Handle unknown errors
  return createErrorResponse('UNKNOWN_ERROR', error.message);
}