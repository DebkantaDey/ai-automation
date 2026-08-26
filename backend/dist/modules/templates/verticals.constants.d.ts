export interface VerticalBlueprint {
    slug: string;
    name: string;
    industry: 'Real Estate' | 'Healthcare & Clinics' | 'Education & Coaching' | 'Salons & Spas' | 'Contractors & Services';
    tagline: string;
    description: string;
    icon: string;
    pipelineStages: string[];
    sampleServices: Array<{
        description: string;
        unitPrice: number;
        category: string;
    }>;
    aiAgent: {
        name: string;
        description: string;
        instructions: string;
        tools: string[];
        model: string;
    };
    workflow: {
        name: string;
        description: string;
        triggerType: string;
        nodes: any[];
        edges: any[];
    };
    sampleLeads: Array<{
        name: string;
        email: string;
        phone: string;
        company?: string;
        notes: string;
        score: number;
    }>;
}
export declare const VERTICAL_BLUEPRINTS: VerticalBlueprint[];
