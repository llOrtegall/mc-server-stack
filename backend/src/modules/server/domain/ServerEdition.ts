export const EDITIONS = ['java', 'bedrock'] as const;

export type ServerEditionValue = (typeof EDITIONS)[number];

/** Which Minecraft edition a server runs: Java or Bedrock. Immutable once set. */
export class ServerEdition {
  static readonly DEFAULT: ServerEditionValue = 'java';

  private constructor(private readonly value: ServerEditionValue) {}

  static create(edition?: string | null): ServerEdition {
    const value = (edition ?? ServerEdition.DEFAULT) as ServerEditionValue;
    ServerEdition.ensureIsValid(value);
    return new ServerEdition(value);
  }

  static fromPrimitive(edition: unknown): ServerEdition {
    return ServerEdition.create(edition as string);
  }

  static ensureIsValid(edition: string): void {
    if (!EDITIONS.includes(edition as ServerEditionValue)) {
      throw new Error(
        `Invalid edition "${edition}". Allowed: ${EDITIONS.join(', ')}`,
      );
    }
  }

  isBedrock(): boolean {
    return this.value === 'bedrock';
  }

  toPrimitive(): ServerEditionValue {
    return this.value;
  }

  equals(other: ServerEdition): boolean {
    return this.value === other.value;
  }
}
