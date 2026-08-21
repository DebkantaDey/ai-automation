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
exports.OrganizationMemberSchema = exports.OrganizationMember = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_enum_1 = require("../../../core/common/enums/role.enum");
let OrganizationMember = class OrganizationMember {
    organizationId;
    userId;
    role;
    roleId;
    status;
    invitedBy;
    joinedAt;
    createdAt;
    updatedAt;
};
exports.OrganizationMember = OrganizationMember;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrganizationMember.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrganizationMember.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(role_enum_1.OrganizationRole), default: role_enum_1.OrganizationRole.MEMBER }),
    __metadata("design:type", String)
], OrganizationMember.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Role', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrganizationMember.prototype, "roleId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'invited', 'suspended'],
        default: 'active',
        index: true,
    }),
    __metadata("design:type", String)
], OrganizationMember.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrganizationMember.prototype, "invitedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], OrganizationMember.prototype, "joinedAt", void 0);
exports.OrganizationMember = OrganizationMember = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], OrganizationMember);
exports.OrganizationMemberSchema = mongoose_1.SchemaFactory.createForClass(OrganizationMember);
exports.OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
exports.OrganizationMemberSchema.index({ userId: 1, status: 1 });
//# sourceMappingURL=organization-member.schema.js.map