import { IntegrationsService, ConnectApiKeyDto } from './integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    getCatalog(): Promise<{
        id: string;
        name: string;
        description: string;
        category: string;
        authType: string;
        supportedActions: string[];
        icon: string;
    }[]>;
    listConnections(orgId: string, wsId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/integration-connection.schema").IntegrationConnectionDocument, {}, {}> & import("./schemas/integration-connection.schema").IntegrationConnection & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    connectWithApiKey(orgId: string, wsId: string, userId: string, dto: ConnectApiKeyDto): Promise<import("./schemas/integration-connection.schema").IntegrationConnectionDocument>;
    getOAuthAuthorizeUrl(provider: string, state: string): Promise<{
        url: string;
    }>;
    handleOAuthCallback(orgId: string, wsId: string, userId: string, provider: string, code: string): Promise<import("./schemas/integration-connection.schema").IntegrationConnectionDocument>;
    testConnection(id: string, orgId: string, wsId: string): Promise<{
        valid: boolean;
        status: string;
    }>;
    disconnect(id: string, orgId: string, wsId: string): Promise<{
        success: boolean;
    }>;
    executeAction(id: string, action: string, params: any): Promise<import("./integration.interface").ActionResult>;
}
