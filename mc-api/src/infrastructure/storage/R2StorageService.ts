import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { Readable } from "stream";
import type { IStorageService } from "./IStorageService.js";
import { logger } from "../logger.js";

export class R2StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    this.bucket = process.env.R2_BUCKET_NAME ?? "mc-backups";

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  async upload(key: string, stream: Readable): Promise<void> {
    logger.info(`Subiendo backup a R2: ${key}`);
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: "application/gzip",
      },
    });
    await upload.done();
    logger.info(`Backup subido correctamente: ${key}`);
  }

  async download(key: string): Promise<Readable> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    if (!response.Body) {
      throw new Error(`Backup no encontrado en R2: ${key}`);
    }
    return response.Body as Readable;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
    logger.info(`Backup eliminado de R2: ${key}`);
  }

  async listByPrefix(prefix: string): Promise<string[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix })
    );
    return (response.Contents ?? []).map((obj) => obj.Key ?? "").filter(Boolean);
  }
}
