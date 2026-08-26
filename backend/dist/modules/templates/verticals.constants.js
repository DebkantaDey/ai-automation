"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERTICAL_BLUEPRINTS = void 0;
exports.VERTICAL_BLUEPRINTS = [
    {
        slug: 'real-estate-agency',
        name: 'Real Estate & Property Advisory Blueprint',
        industry: 'Real Estate',
        tagline: 'Automate property buyer qualification, WhatsApp brochures, and site visits',
        description: 'Complete operational engine for real-estate agencies and property developers. Captures buyer inquiries, qualifies budgets, schedules site visit appointments, and manages negotiation pipelines.',
        icon: 'Building2',
        pipelineStages: [
            'New Lead',
            'Budget Qualified',
            'Site Visit Scheduled',
            'Offer Submitted',
            'Token Advance Paid',
            'Closed Won',
        ],
        sampleServices: [
            { description: 'Premium 3BHK Luxury Penthouse - Unit 1402', unitPrice: 850000, category: 'Residential' },
            { description: 'Commercial Retail Shop - Ground Floor', unitPrice: 320000, category: 'Commercial' },
            { description: 'Property Management & Legal Retainer', unitPrice: 2500, category: 'Services' },
        ],
        aiAgent: {
            name: 'Property Advisor AI',
            description: 'Specialized real estate AI that qualifies buyer requirements and schedules property site tours.',
            instructions: `You are an elite Real Estate Advisory AI for luxury residential and commercial properties.
Your objectives:
1. Greet buyers warmly and ask for their preferred location, configuration (2BHK, 3BHK, Villa), and budget bracket.
2. Use 'lookup_customer' to check if the lead has previous site visits.
3. Use 'search_knowledge_base' to answer questions about amenities, floor plans, and RERA registration.
4. When the buyer is interested in seeing the property, use 'book_appointment' to schedule a Site Visit with a sales agent.
5. If the buyer requests custom discounts above 10%, route through 'apply_discount' for manager approval.`,
            tools: ['lookup_customer', 'create_lead', 'book_appointment', 'send_whatsapp_message', 'search_knowledge_base'],
            model: 'gpt-4o',
        },
        workflow: {
            name: 'Property Lead Qualification & WhatsApp Brochure',
            description: 'Triggered when a buyer submits a property portal inquiry. Evaluates budget and dispatches WhatsApp brochure.',
            triggerType: 'webhook',
            nodes: [
                { id: 'n1', type: 'trigger', label: 'Property Portal Inbound Webhook', position: { x: 250, y: 50 }, data: { triggerType: 'webhook' } },
                { id: 'n2', type: 'ai_classify', label: 'Score Buyer Intent & Budget', position: { x: 250, y: 150 }, data: { prompt: 'Buyer budget ${{trigger.budget}} for {{trigger.propertyType}}' } },
                { id: 'n3', type: 'action_whatsapp', label: 'Send PDF Brochure via WhatsApp', position: { x: 250, y: 250 }, data: { template: 'property_brochure_v1' } },
                { id: 'n4', type: 'action_hubspot', label: 'Sync to CRM Pipeline', position: { x: 250, y: 350 }, data: { stage: 'Budget Qualified' } },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e2', source: 'n2', target: 'n3' },
                { id: 'e3', source: 'n3', target: 'n4' },
            ],
        },
        sampleLeads: [
            { name: 'Vikram Malhotra', email: 'vikram.m@zenithholdings.com', phone: '+1 (555) 349-8821', company: 'Zenith Holdings', notes: 'Looking for 3BHK high-rise apartment near financial district. Budget $900k.', score: 92 },
            { name: 'Pooja Singhania', email: 'pooja.singh@designstudio.io', phone: '+1 (555) 782-9014', company: 'Design Studio', notes: 'Commercial retail showroom inquiry for interior boutique.', score: 84 },
        ],
    },
    {
        slug: 'clinic-healthcare-practice',
        name: 'Healthcare Clinic & Dental Practice Blueprint',
        industry: 'Healthcare & Clinics',
        tagline: 'Patient intake triage, doctor appointment booking, and consultation invoicing',
        description: 'HIPAA-conscious practice management suite for medical, dental, and wellness clinics. Automates patient appointment scheduling, pre-consultation medical questionnaires, and automated WhatsApp appointment reminders.',
        icon: 'Stethoscope',
        pipelineStages: [
            'Inquiry',
            'Triage Completed',
            'Consultation Scheduled',
            'Treatment In Progress',
            'Follow-up & Settle',
        ],
        sampleServices: [
            { description: 'Comprehensive Specialist Medical Consultation', unitPrice: 150, category: 'Consultation' },
            { description: 'Dental Diagnostics, Scaling & Polishing', unitPrice: 280, category: 'Dental' },
            { description: 'Advanced Diagnostic Blood Work & Panel', unitPrice: 120, category: 'Laboratory' },
        ],
        aiAgent: {
            name: 'Clinic Care Reception AI',
            description: 'Compassionate medical clinic virtual assistant for scheduling and patient triage.',
            instructions: `You are the Virtual Medical Receptionist for a high-end multispecialty healthcare clinic.
Your objectives:
1. Assist patients in booking, rescheduling, and preparing for doctor consultations.
2. Check doctor availability using 'book_appointment' and confirm consultation slots.
3. For medical emergencies (severe chest pain, difficulty breathing), immediately instruct patient to call 911 or visit the nearest ER.
4. Use 'create_invoice' to issue digital consultation receipts.
5. Provide pre-visit preparation instructions using 'search_knowledge_base'.`,
            tools: ['lookup_customer', 'book_appointment', 'create_invoice', 'send_whatsapp_message', 'search_knowledge_base'],
            model: 'gpt-4o',
        },
        workflow: {
            name: 'Patient Appointment Booking & Automated Reminders',
            description: 'Books clinic appointment and schedules 24-hour and 2-hour WhatsApp reminder sequences.',
            triggerType: 'webhook',
            nodes: [
                { id: 'n1', type: 'trigger', label: 'Patient Web Booking', position: { x: 250, y: 50 }, data: { triggerType: 'webhook' } },
                { id: 'n2', type: 'action_calendar', label: 'Reserve Doctor Slot', position: { x: 250, y: 150 }, data: { duration: 30 } },
                { id: 'n3', type: 'action_whatsapp', label: 'Send Confirmation & Google Meet/Location', position: { x: 250, y: 250 }, data: {} },
                { id: 'n4', type: 'action_invoice', label: 'Generate Digital Invoice', position: { x: 250, y: 350 }, data: {} },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e2', source: 'n2', target: 'n3' },
                { id: 'e3', source: 'n3', target: 'n4' },
            ],
        },
        sampleLeads: [
            { name: 'Eleanor Vance', email: 'eleanor.vance@gmail.com', phone: '+1 (555) 902-1144', notes: 'Routine annual cardiology checkup and ECG review.', score: 89 },
            { name: 'Dr. Arthur Pendelton', email: 'art.pendelton@biomed.org', phone: '+1 (555) 438-7712', notes: 'Dental implant second opinion consultation.', score: 76 },
        ],
    },
    {
        slug: 'coaching-education-institute',
        name: 'Coaching & Education Institute Blueprint',
        industry: 'Education & Coaching',
        tagline: 'Student counseling, batch enrollment, demo class booking, and course fee collection',
        description: 'End-to-end enrollment engine for test prep academies, coding bootcamps, and executive coaching centers. Automates syllabus downloads, demo class bookings, and course fee instalment links.',
        icon: 'GraduationCap',
        pipelineStages: [
            'New Student Inquiry',
            'Counseling Demo Booked',
            'Demo Attended',
            'Fee Link Sent',
            'Enrolled & Active',
        ],
        sampleServices: [
            { description: 'Full-Stack AI Engineering 12-Week Bootcamp', unitPrice: 3200, category: 'Course' },
            { description: 'Executive 1-on-1 Leadership Coaching (Monthly)', unitPrice: 1500, category: 'Coaching' },
            { description: 'SAT/GMAT Intensive Preparation Track', unitPrice: 950, category: 'Test Prep' },
        ],
        aiAgent: {
            name: 'Academy Admissions Counselor AI',
            description: 'Proactive educational counselor matching student learning goals with curriculum tracks.',
            instructions: `You are the Lead Admissions Counselor AI for an elite education and training academy.
Your objectives:
1. Understand student career goals, current experience level, and target timeline.
2. Recommend the best-matching curriculum and syllabus modules using 'search_knowledge_base'.
3. Use 'book_appointment' to enroll the student into an upcoming Live Demo Workshop.
4. When student decides to enroll, use 'create_invoice' with standard payment link.
5. Create follow-up tasks for academic advisors via 'create_task'.`,
            tools: ['lookup_customer', 'create_lead', 'book_appointment', 'create_invoice', 'create_task', 'send_whatsapp_message', 'search_knowledge_base'],
            model: 'gpt-4o',
        },
        workflow: {
            name: 'Student Demo Class & WhatsApp Syllabus Delivery',
            description: 'Captures student inquiry, emails syllabus PDF, sends WhatsApp greeting, and reserves demo seat.',
            triggerType: 'webhook',
            nodes: [
                { id: 'n1', type: 'trigger', label: 'Course Inquiry Form', position: { x: 250, y: 50 }, data: { triggerType: 'webhook' } },
                { id: 'n2', type: 'ai_classify', label: 'Match Course Track', position: { x: 250, y: 150 }, data: {} },
                { id: 'n3', type: 'action_whatsapp', label: 'Send Syllabus & Webinar Link', position: { x: 250, y: 250 }, data: {} },
                { id: 'n4', type: 'action_task', label: 'Assign Counselor Follow-up Task', position: { x: 250, y: 350 }, data: { priority: 'high' } },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e2', source: 'n2', target: 'n3' },
                { id: 'e3', source: 'n3', target: 'n4' },
            ],
        },
        sampleLeads: [
            { name: 'Rohan Sharma', email: 'rohan.sharma@techcorp.in', phone: '+1 (555) 671-8890', notes: 'Software engineer transitioning to AI Agent Architecture. Interested in 12-week bootcamp.', score: 95 },
            { name: 'Ananya Deshmukh', email: 'ananya.d@fintech.io', phone: '+1 (555) 234-9988', notes: 'GMAT prep inquiry for Fall 2027 MBA applications.', score: 81 },
        ],
    },
    {
        slug: 'salon-spa-wellness',
        name: 'Salon, Spa & Aesthetic Wellness Blueprint',
        industry: 'Salons & Spas',
        tagline: 'Service booking, stylist chair allocation, and automated loyalty marketing',
        description: 'Designed for beauty salons, luxury spas, and aesthetic wellness clinics. Handles multi-service bookings, stylist availability matching, appointment reminder WhatsApps, and repeat customer retention.',
        icon: 'Sparkles',
        pipelineStages: [
            'Appointment Requested',
            'Stylist Confirmed',
            'Service In-Progress',
            'Completed & Paid',
            'Loyalty Re-engagement',
        ],
        sampleServices: [
            { description: 'Balayage Color & Signature Hair Sculpting', unitPrice: 220, category: 'Hair' },
            { description: 'Deep Tissue Aromatherapy Spa (90 Mins)', unitPrice: 160, category: 'Spa' },
            { description: 'HydraFacial Glow Treatment & LED Therapy', unitPrice: 195, category: 'Skincare' },
        ],
        aiAgent: {
            name: 'Spa & Salon Concierge AI',
            description: 'Charming salon booking coordinator ensuring personalized beauty experiences.',
            instructions: `You are the VIP Concierge AI for a luxury beauty salon & wellness spa.
Your objectives:
1. Help clients select services, duration, and preferred stylists/therapists.
2. Check available salon chairs and book appointments via 'book_appointment'.
3. Verify client loyalty tier and past treatment preferences with 'lookup_customer'.
4. Generate digital appointment receipts with 'create_invoice'.
5. Handle cancellation or rescheduling requests gracefully.`,
            tools: ['lookup_customer', 'book_appointment', 'create_invoice', 'send_whatsapp_message', 'search_knowledge_base'],
            model: 'gpt-4o',
        },
        workflow: {
            name: 'Salon Appointment & Post-Service Review Loop',
            description: 'Confirms salon slot, sends preparation tips, and triggers review request 2 hours after appointment.',
            triggerType: 'webhook',
            nodes: [
                { id: 'n1', type: 'trigger', label: 'Salon Booking Submitted', position: { x: 250, y: 50 }, data: { triggerType: 'webhook' } },
                { id: 'n2', type: 'action_calendar', label: 'Lock Stylist Schedule', position: { x: 250, y: 150 }, data: {} },
                { id: 'n3', type: 'action_whatsapp', label: 'Send WhatsApp Booking Confirmation', position: { x: 250, y: 250 }, data: {} },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e2', source: 'n2', target: 'n3' },
            ],
        },
        sampleLeads: [
            { name: 'Chloe Montgomery', email: 'chloe.montgomery@vogue.com', phone: '+1 (555) 773-1928', notes: 'Prefers senior stylist Elena for balayage coloring.', score: 91 },
            { name: 'Marcus Sterling', email: 'm.sterling@investments.com', phone: '+1 (555) 382-9011', notes: 'Weekend 90-min deep tissue massage booking.', score: 85 },
        ],
    },
    {
        slug: 'contractor-professional-services',
        name: 'Contractors & Professional Services Blueprint',
        industry: 'Contractors & Services',
        tagline: 'Project estimates, site inspection scheduling, milestone billing, and contract tasks',
        description: 'Built for construction contractors, HVAC/plumbing specialists, design agencies, and IT consultants. Automates project scope quotes, on-site inspection visits, milestone invoices, and approval workflows.',
        icon: 'Hammer',
        pipelineStages: [
            'Scope Inquiry',
            'Inspection Scheduled',
            'Proposal & Quote Sent',
            'Contract Signed',
            'Milestone In Progress',
            'Project Completed',
        ],
        sampleServices: [
            { description: 'Turnkey Architectural Renovation - Milestone 1', unitPrice: 12500, category: 'Construction' },
            { description: 'Commercial HVAC System Installation & Testing', unitPrice: 6800, category: 'HVAC' },
            { description: 'Structural Engineering Compliance Inspection', unitPrice: 1800, category: 'Inspection' },
        ],
        aiAgent: {
            name: 'Contractor Operations & Estimation AI',
            description: 'Operational AI calculating rough estimates and assigning site inspection tasks.',
            instructions: `You are the Operational Coordinator AI for an enterprise contracting and engineering firm.
Your objectives:
1. Capture client project scope details (square footage, materials, timeline, location).
2. Schedule on-site technical inspection appointments using 'book_appointment'.
3. Generate milestone project invoices with 'create_invoice'.
4. For proposals exceeding $10,000, trigger Human-in-the-Loop manager approval.
5. Create field technician assignment tasks with 'create_task'.`,
            tools: ['lookup_customer', 'create_lead', 'book_appointment', 'create_invoice', 'create_task', 'send_whatsapp_message'],
            model: 'gpt-4o',
        },
        workflow: {
            name: 'Contractor Site Inspection & Milestone Billing Workflow',
            description: 'Books on-site contractor inspection, creates task for project supervisor, and issues deposit invoice.',
            triggerType: 'webhook',
            nodes: [
                { id: 'n1', type: 'trigger', label: 'Commercial Renovation Request', position: { x: 250, y: 50 }, data: { triggerType: 'webhook' } },
                { id: 'n2', type: 'action_task', label: 'Assign Field Supervisor Site Visit', position: { x: 250, y: 150 }, data: { priority: 'urgent' } },
                { id: 'n3', type: 'action_invoice', label: 'Issue 20% Initial Deposit Invoice', position: { x: 250, y: 250 }, data: {} },
                { id: 'n4', type: 'action_whatsapp', label: 'WhatsApp Inspection Schedule to Client', position: { x: 250, y: 350 }, data: {} },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e2', source: 'n2', target: 'n3' },
                { id: 'e3', source: 'n3', target: 'n4' },
            ],
        },
        sampleLeads: [
            { name: 'Robert Callahan', email: 'rcallahan@apexlogistics.com', phone: '+1 (555) 441-2900', company: 'Apex Logistics Corp', notes: '40,000 sq ft warehouse LED lighting and HVAC retrofit.', score: 94 },
            { name: 'Diana Ross', email: 'diana.ross@horizonhotels.com', phone: '+1 (555) 912-3401', company: 'Horizon Hotels', notes: 'Hotel lobby structural redesign and renovation.', score: 88 },
        ],
    },
];
//# sourceMappingURL=verticals.constants.js.map