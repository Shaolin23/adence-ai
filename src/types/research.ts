// /src/types/research.ts
export interface AssessmentInput {
  content: string
  type: 'individual' | 'business'
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
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  timeToImpact: number
  confidence: number
  timeline: {
    shortTerm: TimelinePeriod[]
    mediumTerm: TimelinePeriod[]
    longTerm: TimelinePeriod[]
  }
}

// Enhanced AI Insights types
export interface TaskSpecificImpact {
  task: string
  currentMethod: string
  aiMethod: string
  impactPercentage: number
  timeframe: string
  mitigation: string
}

export interface UniqueStrength {
  strength: string
  whyItMatters: string
  howToLeverage: string
}

export interface AdaptationStrategies {
  immediate: string[]
  shortTerm: string[]
  longTerm: string[]
}

export interface IndustryContext {
  trend: string
  competitiveAdvantage: string
  emergingRoles: string[]
}

export interface ResearchCitation {
  finding: string
  source: string
  relevance: string
}

export interface AIInsights {
  taskSpecificImpacts: TaskSpecificImpact[]
  uniqueStrengths: UniqueStrength[]
  adaptationStrategies: AdaptationStrategies
  industryContext: IndustryContext
  researchCitations: ResearchCitation[]
}

export interface CustomizedRoadmapPhase {
  phase: string
  timeline: string
  actions: string[]
  expectedOutcome: string
}

// Base assessment result
export interface AssessmentResult {
  vulnerabilityIndex: VulnerabilityIndex
  occupations: ProcessedOccupation[]
  recommendations: string[]
  citations: string[]
  generatedAt: string
}

// Enhanced assessment result with AI insights
export interface EnhancedAssessmentResult extends AssessmentResult {
  aiInsights?: AIInsights
  specificRiskFactors?: string[]
  protectiveFactors?: string[]
  customizedRoadmap?: CustomizedRoadmapPhase[]
  confidenceScore?: number
  enhancedAnalysis?: boolean
  insightSource?: string
  metadata?: {
    processingTime: number
    version: string
    researchBasis: string
    enhancedFeatures: {
      aiInsights: boolean
      taskSpecificAnalysis: boolean
      customizedRoadmap: boolean
      industryContext: boolean
      researchCitations: number
    }
    confidenceFactors: {
      occupationMatch: number
      industryKnowledge: number
      researchCoverage: number
      aiAnalysisDepth: number
    }
    performance?: {
      cacheHitRate: number
      requestCount: number
      averageTokens: number
      queueSize: number
    }
    cost?: {
      estimate: string
      currency: string
      model: string
      cached: boolean
    }
  }
}