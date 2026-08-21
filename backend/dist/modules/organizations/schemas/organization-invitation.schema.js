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
exports.OrganizationInvitationSchema = exports.OrganizationInvitation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let OrganizationInvitation = class OrganizationInvitation {
    organizationId;
    email;
    role;
    roleId;
    invitedBy;
    tokenHash;
    expiresAt;
    status;
    acceptedAt;
    createdAt;
    updatedAt;
};
exports.OrganizationInvitation = OrganizationInvitation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrganizationInvitation.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true, index: true }),
    __metadata("design:type", String)
], OrganizationInvitation.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'member' }),
    __metadata("design:type", String)
], OrganizationInvitation.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Role', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrganizationInvitation.prototype, "roleId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrganizationInvitation.prototype, "invitedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], OrganizationInvitation.prototype, "tokenHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], OrganizationInvitation.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['pending', 'accepted', 'declined', 'revoked'],
        default: 'pending',
        index: true,
    }),
    __metadata("design:type", String)
], OrganizationInvitation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], OrganizationInvitation.prototype, "acceptedAt", void 0);
exports.OrganizationInvitation = OrganizationInvitation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], OrganizationInvitation);
exports.OrganizationInvitationSchema = mongoose_1.SchemaFactory.createForClass(OrganizationInvitation);
exports.OrganizationInvitationSchema.index({ organizationId: 1, email: 1, status: 1 });
exports.OrganizationInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//# sourceMappingURL=organization-invitation.schema.js.map