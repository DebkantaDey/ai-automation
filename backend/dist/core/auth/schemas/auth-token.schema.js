"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTokenSchema = exports.AuthToken = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AuthToken = class AuthToken {
    userId;
    tokenHash;
    type;
    isUsed;
    expiresAt;
    usedAt;
    createdAt;
};
exports.AuthToken = AuthToken;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AuthToken.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], AuthToken.prototype, "tokenHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['email_verification', 'password_reset'],
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], AuthToken.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], AuthToken.prototype, "isUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], AuthToken.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AuthToken.prototype, "usedAt", void 0);
exports.AuthToken = AuthToken = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false } })
], AuthToken);
exports.AuthTokenSchema = mongoose_1.SchemaFactory.createForClass(AuthToken);
exports.AuthTokenSchema.index({ userId: 1, type: 1, isUsed: 1 });
exports.AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//# sourceMappingURL=auth-token.schema.js.map