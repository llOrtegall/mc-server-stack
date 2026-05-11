import { PassThrough } from 'node:stream';
import * as dockerService from '../../../docker/docker.service.js';
import type { LogReader } from '../domain/LogReader.js';

const DRAIN_TIMEOUT_MS = 2000;

export class DockerLogReader implements LogReader {
  async getTail(containerId: string, tail: number): Promise<string> {
    const logStream = await dockerService.getLogStream(containerId, tail);
    return new Promise((resolve, reject) => {
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const chunks: string[] = [];

      dockerService.demuxLogs(logStream, stdout, stderr);

      stdout.on('data', (d: Buffer) => chunks.push(d.toString()));
      stderr.on('data', (d: Buffer) => chunks.push(d.toString()));
      stdout.on('end', () => resolve(chunks.join('')));
      stderr.on('error', reject);

      setTimeout(() => {
        (
          logStream as NodeJS.ReadableStream & { destroy?: () => void }
        ).destroy?.();
        resolve(chunks.join(''));
      }, DRAIN_TIMEOUT_MS);
    });
  }
}
