import { apiFetch } from '../../../api/client.js';
import {
  HostResources,
  type HostResourcesPrimitives,
} from '../domain/HostResources.js';
import type { HostResourcesRepository } from '../domain/HostResourcesRepository.js';

export class HttpHostResourcesRepository implements HostResourcesRepository {
  async get(): Promise<HostResources> {
    const data = await apiFetch<HostResourcesPrimitives>(
      '/api/system/resources',
    );
    return HostResources.fromPrimitive(data);
  }
}
