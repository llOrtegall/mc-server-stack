import { HttpHostResourcesRepository } from '../infrastructure/HttpHostResourcesRepository.js';
import { getHostResources } from './getHostResources.js';

const hostResourcesRepository = new HttpHostResourcesRepository();

export const systemFactory = {
  getHostResources: () => getHostResources({ hostResourcesRepository }),
};
