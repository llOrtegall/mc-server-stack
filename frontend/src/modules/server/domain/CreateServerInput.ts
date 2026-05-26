import type { ServerPropertiesInput } from './ServerProperties.js';

/** Raw input the API accepts to provision a new server (camelCase contract). */
export interface CreateServerInput {
  name: string;
  port: number;
  version?: string;
  ramMb?: number;
  cpuLimit?: number;
  properties?: ServerPropertiesInput;
}
