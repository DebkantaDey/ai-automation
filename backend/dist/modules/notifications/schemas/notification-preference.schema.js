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
exports.NotificationPreferenceSchema = exports.NotificationPreference = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let NotificationPreference = class NotificationPreference {
    organizationId;
    workspaceId;
    userId;
    channels;
    events;
    createdAt;
    updatedAt;
};
exports.NotificationPreference = NotificationPreference;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], NotificationPreference.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], NotificationPreference.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], NotificationPreference.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: {
            inApp: true,
            email: true,
            slack: false,
            webhook: false,
        },
    }),
    __metadata("design:type", Object)
], NotificationPreference.prototype, "channels", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: {
            'workflow.completed': true,
            'workflow.failed': true,
            'workflow.waiting_approval': true,
            'payment.succeeded': true,
            'payment.failed': true,
            'trial.ending': true,
            'ai.limit_reached': true,
        },
    }),
    __metadata("design:type", Object)
], NotificationPreference.prototype, "events", void 0);
exports.NotificationPreference = NotificationPreference = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], NotificationPreference);
exports.NotificationPreferenceSchema = mongoose_1.SchemaFactory.createForClass(NotificationPreference);
exports.NotificationPreferenceSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
//# sourceMappingURL=notification-preference.schema.js.map