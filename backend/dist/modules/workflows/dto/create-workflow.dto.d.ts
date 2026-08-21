export declare class CreateWorkflowDto {
    name: string;
    description?: string;
    triggerType?: string;
    triggerConfig?: Record<string, any>;
    nodes?: Array<any>;
    edges?: Array<any>;
    settings?: Record<string, any>;
    status?: string;
}
export declare class TriggerExecutionDto {
    payload?: Record<string, any>;
}
