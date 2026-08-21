"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GoogleSheetsIntegrationProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsIntegrationProvider = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let GoogleSheetsIntegrationProvider = GoogleSheetsIntegrationProvider_1 = class GoogleSheetsIntegrationProvider {
    providerName = 'google_sheets';
    logger = new common_1.Logger(GoogleSheetsIntegrationProvider_1.name);
    async getAccount(credentials) {
        return {
            accountName: 'Google Sheets Integration',
            accountEmail: credentials.extra?.email || 'sheets@google.com',
        };
    }
    async executeAction(action, params, credentials) {
        const spreadsheetId = params.spreadsheetId;
        const range = params.range || 'Sheet1!A:Z';
        const values = params.values || [];
        if (!spreadsheetId) {
            throw new Error('Spreadsheet ID is required for Google Sheets actions');
        }
        if (action === 'append_row') {
            try {
                const res = await axios_1.default.post(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, { values: Array.isArray(values[0]) ? values : [values] }, { headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` } });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error?.message || err.message };
            }
        }
        if (action === 'read_rows') {
            try {
                const res = await axios_1.default.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, { headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` } });
                return { success: true, data: res.data?.values || [] };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error?.message || err.message };
            }
        }
        throw new Error(`Unsupported Google Sheets action: [${action}]`);
    }
    async validateConnection(credentials) {
        return Boolean(credentials.accessToken || credentials.apiKey);
    }
};
exports.GoogleSheetsIntegrationProvider = GoogleSheetsIntegrationProvider;
exports.GoogleSheetsIntegrationProvider = GoogleSheetsIntegrationProvider = GoogleSheetsIntegrationProvider_1 = __decorate([
    (0, common_1.Injectable)()
], GoogleSheetsIntegrationProvider);
//# sourceMappingURL=google-sheets.provider.js.map