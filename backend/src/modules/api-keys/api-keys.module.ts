import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { ApiKeyAuthGuard } from './guards/api-key-auth.guard';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    AuditLogsModule,
  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyAuthGuard],
  exports: [ApiKeysService, ApiKeyAuthGuard, MongooseModule],
})
export class ApiKeysModule {}
