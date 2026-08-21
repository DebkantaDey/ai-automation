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
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_enum_1 = require("../../../core/common/enums/role.enum");
let User = class User {
    firstName;
    lastName;
    email;
    passwordHash;
    profileImage;
    phoneNumber;
    emailVerified;
    status;
    lastLoginAt;
    lastLoginIp;
    lastLoginUserAgent;
    authProviders;
    systemRole;
    isMfaEnabled;
    mfaSecret;
    defaultOrganizationId;
    defaultWorkspaceId;
    createdAt;
    updatedAt;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, select: false }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'suspended', 'pending', 'deleted'],
        default: 'pending',
        index: true,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "lastLoginIp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "lastLoginUserAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                provider: { type: String, required: true },
                providerUserId: { type: String, required: true },
                email: { type: String, required: false },
                connectedAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], User.prototype, "authProviders", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(role_enum_1.SystemRole), default: role_enum_1.SystemRole.USER }),
    __metadata("design:type", String)
], User.prototype, "systemRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isMfaEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, select: false }),
    __metadata("design:type", String)
], User.prototype, "mfaSecret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "defaultOrganizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "defaultWorkspaceId", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.virtual('fullName').get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});
exports.UserSchema.index({ 'authProviders.provider': 1, 'authProviders.providerUserId': 1 });
//# sourceMappingURL=user.schema.js.map