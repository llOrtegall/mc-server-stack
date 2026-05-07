export interface TokenPayload {
  id: string;
}

/**
 * Issues and verifies authentication tokens. Implemented in infrastructure
 * (JWT); use cases depend only on this port.
 */
export interface TokenRepository {
  sign: (adminId: string) => string;
  verify: (token: string) => TokenPayload;
}
