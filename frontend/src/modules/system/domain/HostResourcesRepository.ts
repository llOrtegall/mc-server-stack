import type { HostResources } from './HostResources.js';

export interface HostResourcesRepository {
  get: () => Promise<HostResources>;
}
