import { ApiError } from './ApiError';

export function validateNumericParam(
  value: string | string[] | undefined,
  paramName: string
): number {
  if (typeof value !== 'string') {
    throw new ApiError(400, `Invalid ${paramName}: must be a number`);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new ApiError(400, `Invalid ${paramName}: must be a number`);
  }
  return parsed;
}

export function validateAddToCartBody(body: unknown): {
  id: number;
  quantity: number;
} {
  const { id, quantity } = (body ?? {}) as Record<string, unknown>;

  if (typeof id !== 'number' || Number.isNaN(id)) {
    throw new ApiError(400, 'Invalid id: must be a number');
  }
  if (typeof quantity !== 'number' || Number.isNaN(quantity) || quantity <= 0) {
    throw new ApiError(400, 'Invalid quantity: must be a positive number');
  }

  return { id, quantity };
}

export function validateUpdateQuantityBody(body: unknown): {
  quantity: number;
} {
  const { quantity } = (body ?? {}) as Record<string, unknown>;

  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    throw new ApiError(400, 'Invalid quantity: must be a number');
  }

  return { quantity };
}

export function validateAuthCredentials(body: unknown): {
  username: string;
  password: string;
} {
  const { username, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof username !== 'string' || username.trim().length === 0) {
    throw new ApiError(400, 'Username is required');
  }
  if (typeof password !== 'string' || password.trim().length === 0) {
    throw new ApiError(400, 'Password is required');
  }

  return { username, password };
}
