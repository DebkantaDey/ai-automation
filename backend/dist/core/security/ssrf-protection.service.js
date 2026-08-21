"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsrfProtectionService = void 0;
const common_1 = require("@nestjs/common");
const net = require("net");
let SsrfProtectionService = class SsrfProtectionService {
    BLOCKED_HOSTS = new Set([
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        'metadata.google.internal',
        '169.254.169.254',
    ]);
    isPrivateIp(ip) {
        if (net.isIPv4(ip)) {
            const parts = ip.split('.').map(Number);
            if (parts[0] === 127)
                return true;
            if (parts[0] === 10)
                return true;
            if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
                return true;
            if (parts[0] === 192 && parts[1] === 168)
                return true;
            if (parts[0] === 169 && parts[1] === 254)
                return true;
            if (parts[0] === 0)
                return true;
        }
        else if (net.isIPv6(ip)) {
            if (ip === '::1' || ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) {
                return true;
            }
        }
        return false;
    }
    validateUrl(urlString) {
        let parsed;
        try {
            parsed = new URL(urlString);
        }
        catch {
            throw new common_1.BadRequestException('Invalid URL format');
        }
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new common_1.BadRequestException(`Protocol '${parsed.protocol}' is not allowed`);
        }
        const hostname = parsed.hostname.toLowerCase();
        if (this.BLOCKED_HOSTS.has(hostname)) {
            throw new common_1.BadRequestException(`Access to restricted internal host [${hostname}] is blocked (SSRF Protection)`);
        }
        if (net.isIP(hostname) && this.isPrivateIp(hostname)) {
            throw new common_1.BadRequestException(`Access to private IP address [${hostname}] is blocked (SSRF Protection)`);
        }
        return parsed;
    }
};
exports.SsrfProtectionService = SsrfProtectionService;
exports.SsrfProtectionService = SsrfProtectionService = __decorate([
    (0, common_1.Injectable)()
], SsrfProtectionService);
//# sourceMappingURL=ssrf-protection.service.js.map