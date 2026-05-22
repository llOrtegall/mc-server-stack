import * as dockerService from '../../../docker/docker.service.js';
import { HostResources } from '../domain/HostResources.js';
import type { HostResourcesRepository } from '../domain/HostResourcesRepository.js';

export class DockerHostResourcesRepository implements HostResourcesRepository {
  async get(): Promise<HostResources> {
    const info = await dockerService.getHostInfo();
    const memoryMb = Math.floor(info.memoryBytes / (1024 * 1024));
    return HostResources.create(info.cpuCores, memoryMb);
  }
}
