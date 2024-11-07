import { S3ClientConfig } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config({ path: '.env' });

export const S3Config = (): S3ClientConfig => ({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  }
});
