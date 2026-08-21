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
exports.RoleSchema = exports.Role = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Role = class Role {
    name;
    slug;
    description;
    organizationId;
    permissions;
    isSystemRole;
    isCustom;
    createdAt;
    updatedAt;
};
exports.Role = Role;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Role.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Role.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Role.prototype, "isSystemRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Role.prototype, "isCustom", void 0);
exports.Role = Role = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Role);
exports.RoleSchema = mongoose_1.SchemaFactory.createForClass(Role);
exports.RoleSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
//# sourceMappingURL=role.schema.js.map