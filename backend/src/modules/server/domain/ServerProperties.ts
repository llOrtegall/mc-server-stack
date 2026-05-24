export const DIFFICULTIES = ['peaceful', 'easy', 'normal', 'hard'] as const;
export const GAMEMODES = [
  'survival',
  'creative',
  'adventure',
  'spectator',
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
export type Gamemode = (typeof GAMEMODES)[number];

/** Curated subset of Minecraft server.properties the user can configure. */
export interface ServerPropertiesPrimitives {
  difficulty: Difficulty;
  gamemode: Gamemode;
  maxPlayers: number;
  motd: string;
  pvp: boolean;
  seed: string;
  hardcore: boolean;
  onlineMode: boolean;
  viewDistance: number;
  whitelistEnabled: boolean;
  whitelist: string[];
}

export type ServerPropertiesInput = Partial<ServerPropertiesPrimitives>;

const DEFAULTS: ServerPropertiesPrimitives = {
  difficulty: 'easy',
  gamemode: 'survival',
  maxPlayers: 20,
  motd: '',
  pvp: true,
  seed: '',
  hardcore: false,
  onlineMode: true,
  viewDistance: 10,
  whitelistEnabled: false,
  whitelist: [],
};

export class ServerProperties {
  private constructor(private readonly value: ServerPropertiesPrimitives) {}

  static create(input?: ServerPropertiesInput | null): ServerProperties {
    const value: ServerPropertiesPrimitives = { ...DEFAULTS, ...(input ?? {}) };
    ServerProperties.ensureIsValid(value);
    return new ServerProperties(value);
  }

  static fromPrimitive(data?: ServerPropertiesInput | null): ServerProperties {
    return ServerProperties.create(data);
  }

  static ensureIsValid(v: ServerPropertiesPrimitives): void {
    if (!DIFFICULTIES.includes(v.difficulty)) {
      throw new Error(
        `Invalid difficulty "${v.difficulty}". Allowed: ${DIFFICULTIES.join(', ')}`,
      );
    }
    if (!GAMEMODES.includes(v.gamemode)) {
      throw new Error(
        `Invalid gamemode "${v.gamemode}". Allowed: ${GAMEMODES.join(', ')}`,
      );
    }
    if (!Number.isInteger(v.maxPlayers) || v.maxPlayers < 1) {
      throw new Error('maxPlayers must be a positive integer');
    }
    if (typeof v.motd !== 'string' || v.motd.length > 150) {
      throw new Error('motd cannot exceed 150 characters');
    }
    if (typeof v.pvp !== 'boolean') throw new Error('pvp must be a boolean');
    if (typeof v.seed !== 'string' || v.seed.length > 100) {
      throw new Error('seed cannot exceed 100 characters');
    }
    if (typeof v.hardcore !== 'boolean') {
      throw new Error('hardcore must be a boolean');
    }
    if (typeof v.onlineMode !== 'boolean') {
      throw new Error('onlineMode must be a boolean');
    }
    if (
      !Number.isInteger(v.viewDistance) ||
      v.viewDistance < 3 ||
      v.viewDistance > 32
    ) {
      throw new Error('viewDistance must be an integer between 3 and 32');
    }
    if (typeof v.whitelistEnabled !== 'boolean') {
      throw new Error('whitelistEnabled must be a boolean');
    }
    if (
      !Array.isArray(v.whitelist) ||
      v.whitelist.some((name) => typeof name !== 'string')
    ) {
      throw new Error('whitelist must be a list of usernames');
    }
  }

  toPrimitive(): ServerPropertiesPrimitives {
    return { ...this.value, whitelist: [...this.value.whitelist] };
  }

  equals(other: ServerProperties): boolean {
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}
