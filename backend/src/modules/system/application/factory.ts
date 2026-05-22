import { DockerHostResourcesRepository } from '../infrastructure/DockerHostResourcesRepository.js';
import { getHostResources } from './getHostResources.js';

const hostResourcesRepository = new DockerHostResourcesRepository();

export const systemFactory = {
  getHostResources: () => getHostResources({ hostResourcesRepository }),
};
