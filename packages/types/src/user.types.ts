/**
 * Base user interface shared across all services
 * This is the data transfer object, not the database entity
 */
export interface IUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  birthday?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data returned from JWT token validation
 * Used by guards and decorators across services
 */
export interface JwtUser {
  userId: string;
  email: string;
  username?: string;
}

/**
 * User session information
 */
export interface IUserSession {
  id: string;
  userId: string;
  token: string;
  deviceId: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Response type for authenticated user endpoints
 */
export interface UserResponse {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
}
