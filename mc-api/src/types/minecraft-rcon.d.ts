declare module "minecraft-rcon" {
  interface RconConfig {
    host: string;
    port: number;
    password: string;
    timeout?: number;
  }

  export class Rcon {
    constructor(config: RconConfig);
    send(command: string): Promise<string>;
  }
}
