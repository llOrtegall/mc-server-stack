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

export const DEFAULT_PROPERTIES: ServerPropertiesPrimitives = {
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
