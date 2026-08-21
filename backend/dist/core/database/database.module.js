"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const tenancy_plugin_1 = require("./plugins/tenancy.plugin");
const audit_plugin_1 = require("./plugins/audit.plugin");
const logger = new common_1.Logger('DatabaseModule');
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const dbConfig = configService.get('database');
                    return {
                        uri: dbConfig?.uri,
                        autoIndex: dbConfig?.autoIndex ?? true,
                        maxPoolSize: dbConfig?.maxPoolSize ?? 20,
                        serverSelectionTimeoutMS: dbConfig?.serverSelectionTimeoutMS ?? 5000,
                        connectionFactory: (connection) => {
                            connection.plugin(tenancy_plugin_1.tenancyPlugin);
                            connection.plugin(audit_plugin_1.auditPlugin);
                            connection.on('connected', () => {
                                logger.log('Successfully connected to MongoDB');
                            });
                            connection.on('error', (error) => {
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
        exports: [mongoose_1.MongooseModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map