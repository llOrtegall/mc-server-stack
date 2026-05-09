import { createReadStream, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { config } from '../../../config.js';
import type { BackupStorage } from '../domain/BackupStorage.js';

export class S3BackupStorage implements BackupStorage {
  private readonly client = new S3Client({
    endpoint: config.r2.endpoint,
    region: 'auto',
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
    forcePathStyle: true,
  });

  async upload(
    key: string,
    filePath: string,
    sizeBytes: number,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: config.r2.bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: 'application/gzip',
        ContentLength: sizeBytes,
      }),
    );
  }

  async download(key: string): Promise<string> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: config.r2.bucket, Key: key }),
    );
    if (!response.Body) throw new Error('[S3BackupStorage] Empty backup file');

    const destPath = join('/tmp', `restore-${Date.now()}.tar.gz`);
    await pipeline(response.Body as Readable, createWriteStream(destPath));
    return destPath;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: key }),
    );
  }
}
