// /src/types/research.ts
export interface AssessmentInput {
  content: string
  type: 'individual' | 'business'  // Added this property
  userType?: 'individual' | 'business'  // Keep for backward compatibility
  location?: string
  experienceLevel?: 'entry' | 'mid' | 'senior'
}

export interface WorkActivity {
  id: string
  title: string
  description: string
  importance: number
  level: number
  aiAutomationRisk: number
  aiAugmentationPotential: number
  frequency: number
  complexity: number
}

export interface AIImpactScore {
  automation: number
  augmentation: number
  overall: number
  confidence: number
  studyBasis: string[]
  timeToImpact: number
}

export interface ProcessedOccupation {
  onetSocCode: string
  title: string
  description: string
  jobZone: number
  workActivities: WorkActivity[]
  tasks: string[]
  skills: string[]
  knowledge: string[]
  abilities: string[]
  workContext: Record<string, any>
  education: {
    level: string
    category: string
  }
  interests: string[]
  workValues: string[]
  wages: {
    median: number
    percentile25: number
    percentile75: number
  }
  employment: number
  outlook: string
  aiImpactScore: AIImpactScore
  industry: string
  matchScore: number
}

export interface TimelinePeriod {
  period: string
  description: string
  likelihood: number
  impact: string
}

export interface VulnerabilityBreakdown {
  automation: number
  skillTransfer: number
  geographic: number
  demographic: number
}

export interface VulnerabilityIndex {
  overall: number
  breakdown: VulnerabilityBreakdown
  riskLevel: 'low' | 'medium' | 'high' | 'critical'  // Fixed case
  timeToImpact: number
  confidence: number
  timeline: {
    shortTerm: TimelinePeriod[]
    mediumTerm: TimelinePeriod[]
    longTerm: TimelinePeriod[]
  }
}

export interface AssessmentResult {
  vulnerabilityIndex: VulnerabilityIndex
  occupations: ProcessedOccupation[]
  recommendations: string[]
  citations: string[]
  generatedAt: string
}