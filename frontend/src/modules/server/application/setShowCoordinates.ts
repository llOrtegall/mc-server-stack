import type { Server } from '../domain/Server.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

interface SetShowCoordinatesProps {
  serverRepository: ServerRepository;
  id: string;
  enabled: boolean;
}

export function setShowCoordinates({
  serverRepository,
  id,
  enabled,
}: SetShowCoordinatesProps): Promise<Server> {
  return serverRepository.setShowCoordinates(id, enabled);
}
