import type { Server } from '../domain/Server.js';
import type { ServerPropertiesInput } from '../domain/ServerProperties.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

interface UpdateServerPropertiesProps {
  serverRepository: ServerRepository;
  id: string;
  properties: ServerPropertiesInput;
}

export async function updateServerProperties({
  serverRepository,
  id,
  properties,
}: UpdateServerPropertiesProps): Promise<Server> {
  if (!id) throw new Error('[updateServerProperties] Id must be provided');
  return serverRepository.update(id, properties);
}
