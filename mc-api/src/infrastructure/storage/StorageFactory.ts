import type { IStorageService } from "./IStorageService.js";
import { R2StorageService } from "./R2StorageService.js";
import { LocalStorageService } from "./LocalStorageService.js";
import { logger } from "../logger.js";

export function createStorageService(): IStorageService {
  const r2AccountId = process.env.R2_ACCOUNT_ID;

  if (r2AccountId) {
    logger.info("Storage: usando Cloudflare R2");
    return new R2StorageService();
  }

  logger.info("Storage: usando sistema de archivos local (R2 no configurado)");
  return new LocalStorageService();
}
