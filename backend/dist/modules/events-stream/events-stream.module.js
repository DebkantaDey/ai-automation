"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsStreamModule = void 0;
const common_1 = require("@nestjs/common");
const events_stream_controller_1 = require("./events-stream.controller");
const events_module_1 = require("../../core/events/events.module");
let EventsStreamModule = class EventsStreamModule {
};
exports.EventsStreamModule = EventsStreamModule;
exports.EventsStreamModule = EventsStreamModule = __decorate([
    (0, common_1.Module)({
        imports: [events_module_1.EventsModule],
        controllers: [events_stream_controller_1.EventsStreamController],
    })
], EventsStreamModule);
//# sourceMappingURL=events-stream.module.js.map