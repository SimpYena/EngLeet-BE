import { BullModuleOptions } from '@nestjs/bull';
import { config } from 'dotenv';
config({ path: '.env' });
export const BullConfig = (): BullModuleOptions => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});
