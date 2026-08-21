"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HubSpotIntegrationProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubSpotIntegrationProvider = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let HubSpotIntegrationProvider = HubSpotIntegrationProvider_1 = class HubSpotIntegrationProvider {
    providerName = 'hubspot';
    logger = new common_1.Logger(HubSpotIntegrationProvider_1.name);
    async getAccount(credentials) {
        try {
            const res = await axios_1.default.get('https://api.hubapi.com/crm/v3/info', {
                headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` },
            });
            return {
                accountName: 'HubSpot CRM Account',
                metadata: res.data,
            };
        }
        catch {
            return { accountName: 'HubSpot CRM' };
        }
    }
    async executeAction(action, params, credentials) {
        const token = credentials.accessToken || credentials.apiKey;
        if (action === 'create_contact') {
            const properties = {
                email: params.email,
                firstname: params.firstname || params.firstName,
                lastname: params.lastname || params.lastName,
                company: params.company,
                phone: params.phone,
            };
            try {
                const res = await axios_1.default.post('https://api.hubapi.com/crm/v3/objects/contacts', { properties }, { headers: { Authorization: `Bearer ${token}` } });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.message || err.message };
            }
        }
        if (action === 'get_contact') {
            try {
                const res = await axios_1.default.get(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(params.email)}?idProperty=email`, { headers: { Authorization: `Bearer ${token}` } });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.message || err.message };
            }
        }
        throw new Error(`Unsupported HubSpot action: [${action}]`);
    }
    async validateConnection(credentials) {
        return Boolean(credentials.accessToken || credentials.apiKey);
    }
};
exports.HubSpotIntegrationProvider = HubSpotIntegrationProvider;
exports.HubSpotIntegrationProvider = HubSpotIntegrationProvider = HubSpotIntegrationProvider_1 = __decorate([
    (0, common_1.Injectable)()
], HubSpotIntegrationProvider);
//# sourceMappingURL=hubspot.provider.js.map