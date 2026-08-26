"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const conversation_schema_1 = require("./schemas/conversation.schema");
const message_schema_1 = require("./schemas/message.schema");
const customer_schema_1 = require("../crm/schemas/customer.schema");
const customer_activity_schema_1 = require("../crm/schemas/customer-activity.schema");
const inbox_service_1 = require("./services/inbox.service");
const whatsapp_service_1 = require("./services/whatsapp.service");
const email_channel_service_1 = require("./services/email-channel.service");
const ai_reply_generator_service_1 = require("./services/ai-reply-generator.service");
const inbox_controller_1 = require("./controllers/inbox.controller");
const omnichannel_webhook_controller_1 = require("./controllers/omnichannel-webhook.controller");
const ai_module_1 = require("../../integrations/ai/ai.module");
const events_module_1 = require("../../core/events/events.module");
let InboxModule = class InboxModule {
};
exports.InboxModule = InboxModule;
exports.InboxModule = InboxModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: conversation_schema_1.Conversation.name, schema: conversation_schema_1.ConversationSchema },
                { name: message_schema_1.Message.name, schema: message_schema_1.MessageSchema },
                { name: customer_schema_1.Customer.name, schema: customer_schema_1.CustomerSchema },
                { name: customer_activity_schema_1.CustomerActivity.name, schema: customer_activity_schema_1.CustomerActivitySchema },
            ]),
            ai_module_1.AiModule,
            events_module_1.EventsModule,
        ],
        controllers: [inbox_controller_1.InboxController, omnichannel_webhook_controller_1.OmnichannelWebhookController],
        providers: [
            inbox_service_1.InboxService,
            whatsapp_service_1.WhatsAppService,
            email_channel_service_1.EmailChannelService,
            ai_reply_generator_service_1.AiReplyGeneratorService,
        ],
        exports: [
            inbox_service_1.InboxService,
            whatsapp_service_1.WhatsAppService,
            email_channel_service_1.EmailChannelService,
            ai_reply_generator_service_1.AiReplyGeneratorService,
        ],
    })
], InboxModule);
//# sourceMappingURL=inbox.module.js.map