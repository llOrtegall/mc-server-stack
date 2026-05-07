/**
 * Hashes and verifies plaintext passwords. Implemented in infrastructure
 * (bcrypt); use cases depend only on this port.
 */
export interface PasswordHasher {
  hash: (plain: string) => Promise<string>;
  compare: (plain: string, hash: string) => Promise<boolean>;
}
