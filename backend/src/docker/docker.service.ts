import Docker from 'dockerode'
import type { PassThrough } from 'stream'
import { config } from '../config.js'

export const docker = new Docker({ socketPath: config.dockerSocket })

export interface ContainerOptions {
  id: string
  name: string
  version: string
  port: number
  rconPort: number
  rconPassword: string
  ramMb: number
  cpuLimit: number
}

async function pullImage(image: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) return reject(err)
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}

export async function createContainer(opts: ContainerOptions): Promise<string> {
  const containerName = `mc-server-${opts.id}`
  const dataPath = `${config.mcDataPath}/${opts.id}`

  console.log('[docker] pulling itzg/minecraft-server...')
  await pullImage('itzg/minecraft-server')
  console.log('[docker] image ready')

  const container = await docker.createContainer({
    name: containerName,
    Image: 'itzg/minecraft-server',
    Env: [
      'EULA=TRUE',
      `VERSION=${opts.version}`,
      `MEMORY=${opts.ramMb}m`,
      'ENABLE_RCON=true',
      `RCON_PASSWORD=${opts.rconPassword}`,
      'RCON_PORT=25575',
      'TYPE=VANILLA',
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
  })

  return container.id
}

export async function startContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId)
  await container.start()
}

export async function stopContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId)
  await container.stop({ t: 10 })
}

export async function restartContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId)
  await container.restart({ t: 10 })
}

export async function removeContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId)
  try {
    await container.stop({ t: 5 })
  } catch {
    // already stopped
  }
  await container.remove({ force: true })
}

export async function getContainerStatus(
  containerId: string,
): Promise<string> {
  try {
    const container = docker.getContainer(containerId)
    const info = await container.inspect()
    return info.State.Status ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function getLogStream(
  containerId: string,
  tail: number = 100,
): Promise<NodeJS.ReadableStream> {
  const container = docker.getContainer(containerId)
  const stream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    tail,
    timestamps: true,
  })
  return stream as unknown as NodeJS.ReadableStream
}

export function demuxLogs(
  stream: NodeJS.ReadableStream,
  stdout: PassThrough,
  stderr: PassThrough,
): void {
  docker.modem.demuxStream(stream, stdout, stderr)
}
