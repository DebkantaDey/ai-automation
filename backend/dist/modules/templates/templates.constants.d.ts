export interface WorkflowTemplate {
    slug: string;
    name: string;
    category: 'Sales' | 'Support' | 'E-commerce' | 'HR' | 'Operations';
    description: string;
    icon: string;
    triggerType: string;
    nodes: any[];
    edges: any[];
}
export declare const WORKFLOW_TEMPLATES: WorkflowTemplate[];
