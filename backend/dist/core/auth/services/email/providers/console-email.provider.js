"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConsoleEmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleEmailProvider = void 0;
const common_1 = require("@nestjs/common");
let ConsoleEmailProvider = ConsoleEmailProvider_1 = class ConsoleEmailProvider {
    providerName = 'console';
    logger = new common_1.Logger(ConsoleEmailProvider_1.name);
    async sendEmail(message) {
        this.logger.log(`\n================= [TRANSACTIONAL EMAIL DISPATCH] =================\n` +
            `TO: ${message.to}\n` +
            `SUBJECT: ${message.subject}\n` +
            `CONTENT:\n${message.text || message.html}\n` +
            `===================================================================\n`);
        return true;
    }
};
exports.ConsoleEmailProvider = ConsoleEmailProvider;
exports.ConsoleEmailProvider = ConsoleEmailProvider = ConsoleEmailProvider_1 = __decorate([
    (0, common_1.Injectable)()
], ConsoleEmailProvider);
//# sourceMappingURL=console-email.provider.js.map