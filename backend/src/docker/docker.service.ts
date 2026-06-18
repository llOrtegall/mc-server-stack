import type { PassThrough } from 'node:stream';
import Docker from 'dockerode';
import { config } from '../config.js';
import type { ServerPropertiesPrimitives } from '../modules/server/domain/ServerProperties.js';

export const docker = new Docker({ socketPath: config.dockerSocket });

const JAVA_IMAGE = 'itzg/minecraft-server';
const BEDROCK_IMAGE = 'itzg/minecraft-bedrock-server';
const BEDROCK_PORT = 19132; // fixed UDP port inside the Bedrock container

export interface ContainerOptions {
  id: string;
  name: string;
  edition: string;
  version: string;
  port: number;
  rconPort: number;
  rconPassword: string;
  ramMb: number;
  cpuLimit: number;
  properties: ServerPropertiesPrimitives;
}

/** Maps the curated server.properties bag to itzg/minecraft-server (Java) env vars. */
function javaPropertiesToEnv(p: ServerPropertiesPrimitives): string[] {
  const env = [
    `DIFFICULTY=${p.difficulty}`,
    `MODE=${p.gamemode}`,
    `MAX_PLAYERS=${p.maxPlayers}`,
    `PVP=${p.pvp}`,
    `HARDCORE=${p.hardcore}`,
    `ONLINE_MODE=${p.onlineMode}`,
    `VIEW_DISTANCE=${p.viewDistance}`,
    `ENABLE_WHITELIST=${p.whitelistEnabled}`,
  ];
  if (p.motd) env.push(`MOTD=${p.motd}`);
  if (p.seed) env.push(`SEED=${p.seed}`);
  if (p.whitelist.length > 0) env.push(`WHITELIST=${p.whitelist.join(',')}`);
  return env;
}

/**
 * Maps the curated bag to itzg/minecraft-bedrock-server env vars. Bedrock has a
 * different property surface: `pvp`/`hardcore` and the per-name whitelist have no
 * clean env equivalent, so they are intentionally not emitted; `motd` maps to the
 * server display name and `seed` to the level seed.
 */
function bedrockPropertiesToEnv(p: ServerPropertiesPrimitives): string[] {
  const env = [
    `GAMEMODE=${p.gamemode}`,
    `DIFFICULTY=${p.difficulty}`,
    `MAX_PLAYERS=${p.maxPlayers}`,
    `ONLINE_MODE=${p.onlineMode}`,
    `VIEW_DISTANCE=${p.viewDistance}`,
    `ALLOW_LIST=${p.whitelistEnabled}`,
  ];
  if (p.motd) env.push(`SERVER_NAME=${p.motd}`);
  if (p.seed) env.push(`LEVEL_SEED=${p.seed}`);
  return env;
}

async function pullImage(image: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

async function createBedrockContainer(
  opts: ContainerOptions,
  containerName: string,
  dataPath: string,
): Promise<string> {
  // Bedrock has no RCON; it exposes a single UDP port (19132 inside the container)
  // published to the user-chosen host port.
  const udpPort = `${BEDROCK_PORT}/udp`;
  const container = await docker.createContainer({
    name: containerName,
    Image: BEDROCK_IMAGE,
    Env: [
      'EULA=TRUE',
      `VERSION=${opts.version}`,
      `SERVER_PORT=${BEDROCK_PORT}`,
      ...bedrockPropertiesToEnv(opts.properties),
    ],
    ExposedPorts: { [udpPort]: {} },
    HostConfig: {
      PortBindings: { [udpPort]: [{ HostPort: String(opts.port) }] },
      Binds: [`${dataPath}:/data`],
      Memory: opts.ramMb * 1024 * 1024,
      NanoCpus: Math.round(opts.cpuLimit * 1e9),
      RestartPolicy: { Name: 'no' },
    },
  });
  return container.id;
}

async function createJavaContainer(
  opts: ContainerOptions,
  containerName: string,
  dataPath: string,
): Promise<string> {
  const container = await docker.createContainer({
    name: containerName,
    Image: JAVA_IMAGE,
    Env: [
      'EULA=TRUE',
      `VERSION=${opts.version}`,
      `MEMORY=${opts.ramMb}m`,
      'ENABLE_RCON=true',
      `RCON_PASSWORD=${opts.rconPassword}`,
      'RCON_PORT=25575',
      'TYPE=VANILLA',
      ...javaPropertiesToEnv(opts.properties),
    ],
    ExposedPorts: {
      '25565/tcp': {},
      '25575/tcp': {},
    },
    HostConfig: {
      PortBindings: {
        '25565/tcp': [{ HostPort: String(opts.port) }],
        '25575/tcp': [{ HostPort: String(opts.rconPort) }],
      },
      Binds: [`${dataPath}:/data`],
      Memory: opts.ramMb * 1024 * 1024,
      NanoCpus: Math.round(opts.cpuLimit * 1e9),
      RestartPolicy: { Name: 'no' },
    },
  });
  return container.id;
}

export async function createContainer(opts: ContainerOptions): Promise<string> {
  const containerName = `mc-server-${opts.id}`;
  const dataPath = `${config.mcDataPath}/${opts.id}`;
  const isBedrock = opts.edition === 'bedrock';
  const image = isBedrock ? BEDROCK_IMAGE : JAVA_IMAGE;

  console.log(`[docker] pulling ${image}...`);
  await pullImage(image);
  console.log('[docker] image ready');

  return isBedrock
    ? createBedrockContainer(opts, containerName, dataPath)
    : createJavaContainer(opts, containerName, dataPath);
}

export async function startContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.start();
}

export async function stopContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.stop({ t: 10 });
}

export async function restartContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.restart({ t: 10 });
}

export async function removeContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  try {
    await container.stop({ t: 5 });
  } catch {
    // already stopped
  }
  await container.remove({ force: true });
}

export async function getHostInfo(): Promise<{
  cpuCores: number;
  memoryBytes: number;
}> {
  const info = await docker.info();
  return {
    cpuCores: info.NCPU ?? 0,
    memoryBytes: info.MemTotal ?? 0,
  };
}

export async function getContainerStatus(containerId: string): Promise<string> {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return info.State.Status ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function getLogStream(
  containerId: string,
  tail: number = 100,
): Promise<NodeJS.ReadableStream> {
  const container = docker.getContainer(containerId);
  const stream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    tail,
    timestamps: true,
  });
  return stream as unknown as NodeJS.ReadableStream;
}

export function demuxLogs(
  stream: NodeJS.ReadableStream,
  stdout: PassThrough,
  stderr: PassThrough,
): void {
  docker.modem.demuxStream(stream, stdout, stderr);
}
