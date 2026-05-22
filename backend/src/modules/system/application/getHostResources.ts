import type { HostResources } from '../domain/HostResources.js';
import type { HostResourcesRepository } from '../domain/HostResourcesRepository.js';

interface GetHostResourcesProps {
  hostResourcesRepository: HostResourcesRepository;
}

export async function getHostResources({
  hostResourcesRepository,
}: GetHostResourcesProps): Promise<HostResources> {
  return hostResourcesRepository.get();
}
