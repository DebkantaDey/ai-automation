import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import { tenancyPlugin } from './plugins/tenancy.plugin';
import { auditPlugin } from './plugins/audit.plugin';

const logger = new Logger('DatabaseModule');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        return {
          uri: dbConfig?.uri,
          autoIndex: dbConfig?.autoIndex ?? true,
          maxPoolSize: dbConfig?.maxPoolSize ?? 20,
          serverSelectionTimeoutMS: dbConfig?.serverSelectionTimeoutMS ?? 5000,
          connectionFactory: (connection) => {
            connection.plugin(tenancyPlugin);
            connection.plugin(auditPlugin);

            connection.on('connected', () => {
              logger.log('Successfully connected to MongoDB');
            });
            connection.on('error', (error: any) => {
              logger.error(`MongoDB connection error: ${error?.message || error}`);
            });
            connection.on('disconnected', () => {
              logger.warn('MongoDB connection disconnected');
            });

            return connection;
          },
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
