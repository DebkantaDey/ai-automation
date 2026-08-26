"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const lead_schema_1 = require("./schemas/lead.schema");
const customer_schema_1 = require("./schemas/customer.schema");
const deal_schema_1 = require("./schemas/deal.schema");
const customer_activity_schema_1 = require("./schemas/customer-activity.schema");
const leads_service_1 = require("./services/leads.service");
const customers_service_1 = require("./services/customers.service");
const deals_service_1 = require("./services/deals.service");
const lead_scoring_service_1 = require("./services/lead-scoring.service");
const leads_controller_1 = require("./controllers/leads.controller");
const customers_controller_1 = require("./controllers/customers.controller");
const deals_controller_1 = require("./controllers/deals.controller");
const ai_module_1 = require("../../integrations/ai/ai.module");
const events_module_1 = require("../../core/events/events.module");
let CrmModule = class CrmModule {
};
exports.CrmModule = CrmModule;
exports.CrmModule = CrmModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: lead_schema_1.Lead.name, schema: lead_schema_1.LeadSchema },
                { name: customer_schema_1.Customer.name, schema: customer_schema_1.CustomerSchema },
                { name: deal_schema_1.Deal.name, schema: deal_schema_1.DealSchema },
                { name: customer_activity_schema_1.CustomerActivity.name, schema: customer_activity_schema_1.CustomerActivitySchema },
            ]),
            ai_module_1.AiModule,
            events_module_1.EventsModule,
        ],
        controllers: [leads_controller_1.LeadsController, customers_controller_1.CustomersController, deals_controller_1.DealsController],
        providers: [leads_service_1.LeadsService, customers_service_1.CustomersService, deals_service_1.DealsService, lead_scoring_service_1.LeadScoringService],
        exports: [leads_service_1.LeadsService, customers_service_1.CustomersService, deals_service_1.DealsService, lead_scoring_service_1.LeadScoringService],
    })
], CrmModule);
//# sourceMappingURL=crm.module.js.map