/**
 * Enhanced AI Assessment Engine with OpenAI Integration
 * Adds nuanced, specific insights to the validated Microsoft Research algorithm
 */

import OpenAI from 'openai'
import { 
  AssessmentInput, 
  AssessmentResult,
  ProcessedOccupation,
  VulnerabilityIndex
} from '@/types/research'
import { ValidatedAssessmentEngine } from './assessment-engine'

// Enhanced types for AI insights
interface AIInsights {
  taskSpecificImpacts: {
    task: string
    currentMethod: string
    aiMethod: string
    impactPercentage: number
    timeframe: string
    mitigation: string
  }[]
  uniqueStrengths: {
    strength: string
    whyItMatters: string
    howToLeverage: string
  }[]
  adaptationStrategies: {
    immediate: string[]  // 0-6 months
    shortTerm: string[]  // 6-18 months
    longTerm: string[]   // 18+ months
  }
  industryContext: {
    trend: string
    competitiveAdvantage: string
    emergingRoles: string[]
  }
  researchCitations: {
    finding: string
    source: string
    relevance: string
  }[]
}

interface EnhancedAssessmentResult extends AssessmentResult {
  aiInsights: AIInsights
  specificRiskFactors: string[]
  protectiveFactors: string[]
  customizedRoadmap: {
    phase: string
    timeline: string
    actions: string[]
    expectedOutcome: string
  }[]
  confidenceScore: number
}

interface DetailedFeatures {
  jobTitle: string
  yearsExperience: number
  technicalSkills: string[]
  softwareTools: string[]
  managementLevel: 'individual' | 'team_lead' | 'manager' | 'director' | 'executive'
  specificActivities: string[]
  industryKeywords: string[]
  educationLevel: string
  certifications: string[]
}

export class EnhancedAIAssessmentEngine extends ValidatedAssessmentEngine {
  private openai: OpenAI
  private insightCache: Map<string, AIInsights>
  
  constructor(apiKey: string) {
    super()
    this.openai = new OpenAI({
      apiKey: apiKey
    })
    this.insightCache = new Map()
  }
  
  /**
   * Enhanced assessment with AI insights
   */
  async assess(input: AssessmentInput): Promise<EnhancedAssessmentResult> {
    console.log('🤖 Running Enhanced AI Assessment...')
    
    // Step 1: Run base validated algorithm
    const baseAssessment = await super.assess(input)
    
    // Step 2: Extract detailed features from resume
    const detailedFeatures = this.extractDetailedFeatures(input.content)
    
    // Step 3: Generate AI insights (with caching)
    const cacheKey = this.generateCacheKey(input.content)
    let aiInsights = this.insightCache.get(cacheKey)
    
    if (!aiInsights) {
      aiInsights = await this.generateAIInsights(
        input,
        baseAssessment,
        detailedFeatures
      )
      this.insightCache.set(cacheKey, aiInsights)
    }
    
    // Step 4: Generate specific risk and protective factors
    const specificRiskFactors = this.identifySpecificRisks(
      detailedFeatures,
      baseAssessment.vulnerabilityIndex
    )
    
    const protectiveFactors = this.identifyProtectiveFactors(
      detailedFeatures,
      aiInsights
    )
    
    // Step 5: Create customized roadmap
    const customizedRoadmap = this.createCustomRoadmap(
      baseAssessment.vulnerabilityIndex,
      detailedFeatures,
      aiInsights
    )
    
    // Step 6: Calculate enhanced confidence score
    const confidenceScore = this.calculateEnhancedConfidence(
      baseAssessment,
      detailedFeatures,
      aiInsights
    )
    
    return {
      ...baseAssessment,
      aiInsights,
      specificRiskFactors,
      protectiveFactors,
      customizedRoadmap,
      confidenceScore
    }
  }
  
  /**
   * Generate nuanced AI insights using GPT-4o-mini
   */
  private async generateAIInsights(
    input: AssessmentInput,
    assessment: AssessmentResult,
    features: DetailedFeatures
  ): Promise<AIInsights> {
    try {
      const systemPrompt = `You are an expert AI impact analyst with access to:
- Microsoft Research: 200,000 AI conversation analysis showing occupation-specific impacts
- Goldman Sachs: 300M jobs affected globally, $7T economic impact projections
- McKinsey: 60-70% task automation potential, 13% workforce transitions by 2030
- PwC: 33% wage premium for AI-skilled workers
- O*NET: Comprehensive occupation and task data

Analyze the specific role and provide detailed, nuanced insights that go beyond generic advice.
Focus on concrete, actionable intelligence specific to this person's situation.`

      const userPrompt = `Analyze this specific role for AI impact:

JOB DETAILS:
- Title: ${features.jobTitle || 'Not specified'}
- Experience: ${features.yearsExperience} years
- Industry: ${assessment.occupations[0]?.industry || 'General'}
- Technical Skills: ${features.technicalSkills.join(', ') || 'Various'}
- Tools Used: ${features.softwareTools.join(', ') || 'Standard'}
- Management Level: ${features.managementLevel}

VALIDATED ASSESSMENT RESULTS:
- Overall AI Risk: ${assessment.vulnerabilityIndex.overall}%
- Automation Risk: ${assessment.vulnerabilityIndex.breakdown.automation}%
- Time to Impact: ${assessment.vulnerabilityIndex.timeToImpact} months
- Risk Level: ${assessment.vulnerabilityIndex.riskLevel}

SPECIFIC ACTIVITIES MENTIONED:
${features.specificActivities.map(a => `- ${a}`).join('\n')}

Provide a detailed JSON response with:
1. taskSpecificImpacts: For each major task, explain exactly how AI will change it
2. uniqueStrengths: Identify 3-4 unique advantages this person has that AI cannot replicate
3. adaptationStrategies: Specific actions for immediate (0-6mo), short (6-18mo), and long-term (18+mo)
4. industryContext: Trends, competitive advantages, and emerging roles in their specific industry
5. researchCitations: Specific data points from the research that apply to this role

Be specific, actionable, and reference actual research findings. Avoid generic advice.`

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500
      })
      
      const insights = JSON.parse(response.choices[0].message.content || '{}')
      
      // Ensure all required fields exist
      return this.validateAndEnrichInsights(insights, features, assessment)
      
    } catch (error) {
      console.error('Error generating AI insights:', error)
      // Return fallback insights based on algorithm alone
      return this.generateFallbackInsights(features, assessment)
    }
  }
  
  /**
   * Extract detailed features from resume content
   */
  private extractDetailedFeatures(content: string): DetailedFeatures {
    const lower = content.toLowerCase()
    
    // Extract job title (look for common patterns)
    const jobTitle = this.extractJobTitle(content)
    
    // Extract years of experience
    const yearsExperience = this.extractYearsExperience(content)
    
    // Extract technical skills
    const technicalSkills = this.extractTechnicalSkills(lower)
    
    // Extract software tools
    const softwareTools = this.extractSoftwareTools(lower)
    
    // Detect management level
    const managementLevel = this.detectManagementLevel(lower)
    
    // Extract specific activities
    const specificActivities = this.extractSpecificActivities(content)
    
    // Extract industry keywords
    const industryKeywords = this.extractIndustryKeywords(lower)
    
    // Extract education level
    const educationLevel = this.extractEducationLevel(lower)
    
    // Extract certifications
    const certifications = this.extractCertifications(content)
    
    return {
      jobTitle,
      yearsExperience,
      technicalSkills,
      softwareTools,
      managementLevel,
      specificActivities,
      industryKeywords,
      educationLevel,
      certifications
    }
  }
  
  private extractJobTitle(content: string): string {
    // Common job title patterns
    const patterns = [
      /(?:current role|position|title)[:.]?\s*([^\n]+)/i,
      /(?:working as|work as|employed as)\s+(?:a|an)?\s*([^\n]+)/i,
      /^([A-Z][^.!?\n]{10,50})$/m // Line that looks like a title
    ]
    
    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }
    
    return 'Professional'
  }
  
  private extractYearsExperience(content: string): number {
    const patterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
      /experience[:.]?\s*(\d+)\+?\s*years?/i,
      /(\d+)\s*years?\s*in\s*(?:the\s*)?industry/i
    ]
    
    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return parseInt(match[1])
    }
    
    // Estimate based on career indicators
    if (content.includes('senior') || content.includes('lead')) return 8
    if (content.includes('mid') || content.includes('experienced')) return 5
    if (content.includes('junior') || content.includes('entry')) return 2
    
    return 3 // Default
  }
  
  private extractTechnicalSkills(content: string): string[] {
    const skills: string[] = []
    
    const techKeywords = [
      'python', 'javascript', 'java', 'c++', 'sql', 'react', 'node.js',
      'machine learning', 'data analysis', 'cloud computing', 'devops',
      'agile', 'scrum', 'git', 'docker', 'kubernetes', 'aws', 'azure',
      'tableau', 'power bi', 'excel', 'statistical analysis', 'project management'
    ]
    
    techKeywords.forEach(skill => {
      if (content.includes(skill)) {
        skills.push(skill)
      }
    })
    
    return skills
  }
  
  private extractSoftwareTools(content: string): string[] {
    const tools: string[] = []
    
    const toolPatterns = [
      'salesforce', 'sap', 'oracle', 'microsoft office', 'google workspace',
      'jira', 'confluence', 'slack', 'zoom', 'photoshop', 'autocad',
      'solidworks', 'matlab', 'spss', 'quickbooks', 'hubspot'
    ]
    
    toolPatterns.forEach(tool => {
      if (content.includes(tool)) {
        tools.push(tool)
      }
    })
    
    return tools
  }
  
  private detectManagementLevel(content: string): 'individual' | 'team_lead' | 'manager' | 'director' | 'executive' {
    if (content.includes('ceo') || content.includes('cto') || content.includes('vp')) return 'executive'
    if (content.includes('director')) return 'director'
    if (content.includes('manager') || content.includes('head of')) return 'manager'
    if (content.includes('lead') || content.includes('supervisor')) return 'team_lead'
    return 'individual'
  }
  
  private extractSpecificActivities(content: string): string[] {
    const activities: string[] = []
    
    // Look for bullet points or action verbs
    const actionPatterns = [
      /[•\-*]\s*([A-Z][^.!?\n]{20,100})/g,
      /(?:responsible for|duties include|tasks?:)\s*([^.!?\n]+)/gi
    ]
    
    actionPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        activities.push(match[1].trim())
        if (activities.length >= 5) break // Limit to top 5
      }
    })
    
    return activities
  }
  
  private extractIndustryKeywords(content: string): string[] {
    const industries = [
      'technology', 'healthcare', 'finance', 'education', 'manufacturing',
      'retail', 'consulting', 'legal', 'construction', 'hospitality',
      'automotive', 'aerospace', 'energy', 'pharmaceutical', 'media'
    ]
    
    return industries.filter(industry => content.includes(industry))
  }
  
  private extractEducationLevel(content: string): string {
    if (content.includes('phd') || content.includes('doctorate')) return 'PhD'
    if (content.includes('master') || content.includes('mba')) return 'Masters'
    if (content.includes('bachelor') || content.includes('bs') || content.includes('ba')) return 'Bachelors'
    if (content.includes('associate')) return 'Associates'
    return 'Bachelors' // Default assumption
  }
  
  private extractCertifications(content: string): string[] {
    const certs: string[] = []
    
    const certPatterns = [
      /certified\s+([^\n,]+)/gi,
      /certification(?:s)?[:.]?\s*([^\n]+)/gi,
      /(?:pmp|cpa|cfa|cissp|ccna|aws|azure|gcp)\s*(?:certified)?/gi
    ]
    
    certPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        certs.push(match[0].trim())
      }
    })
    
    return certs.slice(0, 5) // Limit to 5
  }
  
  /**
   * Identify specific risk factors
   */
  private identifySpecificRisks(
    features: DetailedFeatures,
    vulnerability: VulnerabilityIndex
  ): string[] {
    const risks: string[] = []
    
    // High automation risk factors
    if (vulnerability.breakdown.automation > 70) {
      risks.push(`High automation risk: ${vulnerability.breakdown.automation}% of core tasks can be automated`)
    }
    
    // Low tech skills
    if (features.technicalSkills.length < 3) {
      risks.push('Limited technical skills may accelerate displacement timeline')
    }
    
    // Routine work indicators
    if (features.specificActivities.some(a => 
      a.toLowerCase().includes('data entry') || 
      a.toLowerCase().includes('routine') ||
      a.toLowerCase().includes('repetitive')
    )) {
      risks.push('Routine task components highly vulnerable to AI automation')
    }
    
    // Industry-specific risks
    if (features.industryKeywords.includes('retail') || features.industryKeywords.includes('customer service')) {
      risks.push('Industry experiencing rapid AI adoption in customer-facing roles')
    }
    
    // Experience level risks
    if (features.yearsExperience < 3) {
      risks.push('Early career stage increases vulnerability to AI displacement')
    }
    
    return risks
  }
  
  /**
   * Identify protective factors
   */
  private identifyProtectiveFactors(
    features: DetailedFeatures,
    insights: AIInsights
  ): string[] {
    const factors: string[] = []
    
    // Management protection
    if (features.managementLevel !== 'individual') {
      factors.push(`${features.managementLevel} role provides human leadership advantage`)
    }
    
    // Technical skill protection
    if (features.technicalSkills.length > 5) {
      factors.push('Strong technical portfolio enables AI tool mastery')
    }
    
    // Industry-specific expertise
    if (features.certifications.length > 0) {
      factors.push(`Specialized certifications (${features.certifications.length}) create expertise moat`)
    }
    
    // Experience protection
    if (features.yearsExperience > 10) {
      factors.push('Deep domain expertise difficult for AI to replicate')
    }
    
    // Add from AI insights
    insights.uniqueStrengths.forEach(strength => {
      factors.push(strength.strength)
    })
    
    return factors.slice(0, 6) // Limit to top 6
  }
  
  /**
   * Create customized career roadmap
   */
  private createCustomRoadmap(
    vulnerability: VulnerabilityIndex,
    features: DetailedFeatures,
    insights: AIInsights
  ): any[] {
    const roadmap = []
    
    // Immediate phase (0-6 months)
    roadmap.push({
      phase: 'Immediate',
      timeline: '0-6 months',
      actions: insights.adaptationStrategies.immediate || [
        'Master AI tools relevant to your role',
        'Document unique value you provide',
        'Join AI-focused professional communities'
      ],
      expectedOutcome: 'Position as AI-enabled professional, not AI-replaceable'
    })
    
    // Short-term phase (6-18 months)
    roadmap.push({
      phase: 'Short-term',
      timeline: '6-18 months',
      actions: insights.adaptationStrategies.shortTerm || [
        'Develop AI prompt engineering expertise',
        'Lead AI implementation projects',
        'Build cross-functional skills'
      ],
      expectedOutcome: 'Become go-to person for AI integration in your domain'
    })
    
    // Long-term phase (18+ months)
    roadmap.push({
      phase: 'Long-term',
      timeline: '18+ months',
      actions: insights.adaptationStrategies.longTerm || [
        'Transition to AI-augmented role design',
        'Develop AI strategy expertise',
        'Create new hybrid role opportunities'
      ],
      expectedOutcome: 'Secure position in AI-transformed industry landscape'
    })
    
    return roadmap
  }
  
  /**
   * Calculate enhanced confidence score
   */
  private calculateEnhancedConfidence(
    assessment: AssessmentResult,
    features: DetailedFeatures,
    insights: AIInsights
  ): number {
    let confidence = assessment.vulnerabilityIndex.confidence
    
    // Boost for detailed features
    if (features.jobTitle !== 'Professional') confidence += 5
    if (features.technicalSkills.length > 3) confidence += 3
    if (features.certifications.length > 0) confidence += 2
    if (insights.researchCitations.length > 3) confidence += 5
    
    return Math.min(95, confidence)
  }
  
  /**
   * Validate and enrich AI insights
   */
  private validateAndEnrichInsights(
    insights: any,
    features: DetailedFeatures,
    assessment: AssessmentResult
  ): AIInsights {
    // Ensure all required fields exist with defaults
    return {
      taskSpecificImpacts: insights.taskSpecificImpacts || this.generateDefaultTaskImpacts(features),
      uniqueStrengths: insights.uniqueStrengths || this.generateDefaultStrengths(features),
      adaptationStrategies: insights.adaptationStrategies || this.generateDefaultStrategies(assessment),
      industryContext: insights.industryContext || this.generateDefaultContext(features),
      researchCitations: insights.researchCitations || this.generateDefaultCitations(assessment)
    }
  }
  
  /**
   * Generate fallback insights if AI fails
   */
  private generateFallbackInsights(
    features: DetailedFeatures,
    assessment: AssessmentResult
  ): AIInsights {
    return {
      taskSpecificImpacts: this.generateDefaultTaskImpacts(features),
      uniqueStrengths: this.generateDefaultStrengths(features),
      adaptationStrategies: this.generateDefaultStrategies(assessment),
      industryContext: this.generateDefaultContext(features),
      researchCitations: this.generateDefaultCitations(assessment)
    }
  }
  
  private generateDefaultTaskImpacts(features: DetailedFeatures): any[] {
    return features.specificActivities.slice(0, 3).map(task => ({
      task,
      currentMethod: 'Manual process',
      aiMethod: 'AI-assisted automation',
      impactPercentage: 40,
      timeframe: '12-24 months',
      mitigation: 'Develop oversight and quality control expertise'
    }))
  }
  
  private generateDefaultStrengths(features: DetailedFeatures): any[] {
    const strengths = []
    
    if (features.managementLevel !== 'individual') {
      strengths.push({
        strength: 'Leadership and team management',
        whyItMatters: 'AI cannot replace human leadership and empathy',
        howToLeverage: 'Focus on strategic decisions and team development'
      })
    }
    
    if (features.yearsExperience > 5) {
      strengths.push({
        strength: 'Deep domain expertise',
        whyItMatters: 'Contextual knowledge AI lacks',
        howToLeverage: 'Become AI trainer and quality validator in your domain'
      })
    }
    
    strengths.push({
      strength: 'Human creativity and intuition',
      whyItMatters: 'AI follows patterns, humans create new ones',
      howToLeverage: 'Focus on innovative problem-solving and creative solutions'
    })
    
    return strengths
  }
  
  private generateDefaultStrategies(assessment: AssessmentResult): any {
    const level = assessment.vulnerabilityIndex.riskLevel
    
    return {
      immediate: [
        'Learn to use ChatGPT, Claude, or Copilot for your daily tasks',
        'Document your unique expertise and decision-making process',
        'Start building an AI tool portfolio'
      ],
      shortTerm: [
        'Complete AI certification relevant to your field',
        'Lead an AI pilot project in your organization',
        'Network with AI professionals in your industry'
      ],
      longTerm: [
        'Position yourself as an AI-human collaboration expert',
        'Develop new service offerings around AI implementation',
        'Create intellectual property leveraging AI tools'
      ]
    }
  }
  
  private generateDefaultContext(features: DetailedFeatures): any {
    return {
      trend: 'Rapid AI adoption accelerating across all industries',
      competitiveAdvantage: 'Early adopters gaining 20-30% productivity advantages',
      emergingRoles: [
        'AI Implementation Specialist',
        'Human-AI Collaboration Designer',
        'AI Ethics and Governance Lead'
      ]
    }
  }
  
  private generateDefaultCitations(assessment: AssessmentResult): any[] {
    return [
      {
        finding: `${assessment.vulnerabilityIndex.overall}% AI automation risk`,
        source: 'Microsoft Research (2024)',
        relevance: 'Based on 200,000 AI conversation analysis'
      },
      {
        finding: '33% wage premium for AI-skilled workers',
        source: 'PwC AI Jobs Barometer (2025)',
        relevance: 'Indicates value of AI upskilling'
      },
      {
        finding: '13% of workforce needs career change by 2030',
        source: 'McKinsey Future of Work (2025)',
        relevance: 'Timeline for career adaptation'
      }
    ]
  }
  
  /**
   * Generate cache key for insights
   */
  private generateCacheKey(content: string): string {
    // Simple hash for caching
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
  }
}

// Export enhanced engine
export const createEnhancedEngine = (apiKey: string) => {
  return new EnhancedAIAssessmentEngine(apiKey)
}