import type { Readable } from "stream";

export interface IStorageService {
  upload(key: string, stream: Readable): Promise<void>;
  download(key: string): Promise<Readable>;
  delete(key: string): Promise<void>;
  listByPrefix(prefix: string): Promise<string[]>;
}
