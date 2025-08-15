import { WorkActivity } from '@/types/research'

// Based on O*NET work activities with AI impact data from our research meta-analysis
export const WORK_ACTIVITIES: WorkActivity[] = [
  // High automation risk activities
  {
    id: 'data_entry',
    name: 'Processing Information',
    category: 'Information Processing',
    description: 'Compiling, coding, categorizing, calculating, tabulating, auditing, or verifying information or data',
    automationRisk: 95,
    augmentationPotential: 85,
    onetCode: '4.A.2.a.3'
  },
  {
    id: 'document_prep',
    name: 'Documenting/Recording Information',
    category: 'Information Processing', 
    description: 'Entering, transcribing, recording, storing, or maintaining information in written or electronic form',
    automationRisk: 90,
    augmentationPotential: 80,
    onetCode: '4.A.2.b.5'
  },
  {
    id: 'basic_analysis',
    name: 'Analyzing Data or Information',
    category: 'Mental Processes',
    description: 'Identifying the underlying principles, reasons, or facts of information by breaking down information',
    automationRisk: 75,
    augmentationPotential: 95,
    onetCode: '4.A.2.a.1'
  },
  
  // Medium automation risk activities
  {
    id: 'writing',
    name: 'Writing and Editing',
    category: 'Communication',
    description: 'Creating written content, editing materials, and communicating information in writing',
    automationRisk: 65,
    augmentationPotential: 90,
    onetCode: '4.A.2.b.1'
  },
  {
    id: 'customer_service',
    name: 'Communicating with People Outside Organization',
    category: 'Communication',
    description: 'Communicating with people outside the organization, representing the organization to customers',
    automationRisk: 60,
    augmentationPotential: 85,
    onetCode: '4.A.4.a.4'
  },
  {
    id: 'getting_information',
    name: 'Getting Information',
    category: 'Information Processing',
    description: 'Observing, receiving, and otherwise obtaining information from all relevant sources',
    automationRisk: 55,
    augmentationPotential: 95,
    onetCode: '4.A.2.a.5'
  },

  // Lower automation risk activities
  {
    id: 'decision_making',
    name: 'Making Decisions and Solving Problems',
    category: 'Mental Processes',
    description: 'Analyzing information and evaluating results to choose the best solution and solve problems',
    automationRisk: 35,
    augmentationPotential: 85,
    onetCode: '4.A.2.a.2'
  },
  {
    id: 'creative_thinking',
    name: 'Thinking Creatively',
    category: 'Mental Processes',
    description: 'Developing, designing, or creating new applications, ideas, relationships, systems, or products',
    automationRisk: 25,
    augmentationPotential: 70,
    onetCode: '4.A.2.a.4'
  },
  {
    id: 'interpersonal',
    name: 'Establishing and Maintaining Interpersonal Relationships',
    category: 'Work Output',
    description: 'Developing constructive and cooperative working relationships with others',
    automationRisk: 15,
    augmentationPotential: 45,
    onetCode: '4.A.4.a.1'
  },

  // Physical activities (low automation risk)
  {
    id: 'physical_activities',
    name: 'Performing General Physical Activities',
    category: 'Physical Work Activities',
    description: 'Performing physical activities that require considerable use of arms, legs, and moving the whole body',
    automationRisk: 10,
    augmentationPotential: 20,
    onetCode: '4.A.3.a.3'
  },
  {
    id: 'equipment_operation',
    name: 'Operating Vehicles, Mechanized Devices, or Equipment',
    category: 'Physical Work Activities',
    description: 'Running, maneuvering, navigating, or driving vehicles or mechanized equipment',
    automationRisk: 45, // Higher due to autonomous vehicles
    augmentationPotential: 60,
    onetCode: '4.A.3.a.1'
  }
]

// Activity categories with average risk scores
export const ACTIVITY_CATEGORIES = {
  'Information Processing': { avgAutomation: 75, avgAugmentation: 85 },
  'Mental Processes': { avgAutomation: 45, avgAugmentation: 75 },
  'Communication': { avgAutomation: 55, avgAugmentation: 85 },
  'Physical Work Activities': { avgAutomation: 25, avgAugmentation: 40 },
  'Work Output': { avgAutomation: 20, avgAugmentation: 50 }
} as const