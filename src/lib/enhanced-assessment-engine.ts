/**
 * Enhanced AI Assessment Engine with OpenAI Integration
 * Adds nuanced, specific insights to the validated Microsoft Research algorithm
 * OPTIMIZED VERSION with caching, batching, and cost reduction
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

// Batch request structure
interface BatchRequest {
  id: string
  input: AssessmentInput
  features: DetailedFeatures
  baseAssessment: AssessmentResult
  resolve: (value: AIInsights) => void
  reject: (error: any) => void
}

export class EnhancedAIAssessmentEngine extends ValidatedAssessmentEngine {
  private openai: OpenAI
  private insightCache: Map<string, { data: AIInsights; timestamp: number }>
  private batchQueue: BatchRequest[] = []
  private batchTimer: NodeJS.Timeout | null = null
  
  // Optimization settings
  private readonly CACHE_TTL = 3600000 // 1 hour
  private readonly MAX_CACHE_SIZE = 100
  private readonly BATCH_SIZE = 3 // Reduced for better response times
  private readonly BATCH_DELAY = 150 // ms
  private readonly MAX_RETRIES = 2
  
  // Metrics
  private requestCount = 0
  private cacheHits = 0
  private totalTokens = 0
  private totalCost = 0
  
  constructor(apiKey: string) {
    super()
    this.openai = new OpenAI({
      apiKey: apiKey,
      maxRetries: this.MAX_RETRIES,
    })
    this.insightCache = new Map()
    
    // Cleanup old cache entries periodically
    setInterval(() => this.cleanupCache(), 300000) // Every 5 minutes
  }
  
  /**
   * Enhanced assessment with AI insights
   */
  async assess(input: AssessmentInput): Promise<EnhancedAssessmentResult> {
    console.log('🤖 Running Enhanced AI Assessment with optimizations...')
    
    // Step 1: Run base validated algorithm
    const baseAssessment = await super.assess(input)
    
    // Step 2: Extract detailed features from resume
    const detailedFeatures = this.extractDetailedFeatures(input.content)
    
    // Step 3: Check cache first
    const cacheKey = this.generateCacheKey(input.content, detailedFeatures)
    const cachedInsights = this.getCachedInsights(cacheKey)
    
    let aiInsights: AIInsights
    if (cachedInsights) {
      console.log('✅ Using cached AI insights')
      this.cacheHits++
      aiInsights = cachedInsights
    } else {
      // Generate new insights (with batching for efficiency)
      aiInsights = await this.generateAIInsightsWithBatching(
        input,
        baseAssessment,
        detailedFeatures
      )
      // Cache the results
      this.setCachedInsights(cacheKey, aiInsights)
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
   * Generate AI insights with batching for efficiency
   */
  private async generateAIInsightsWithBatching(
    input: AssessmentInput,
    assessment: AssessmentResult,
    features: DetailedFeatures
  ): Promise<AIInsights> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest = {
        id: Math.random().toString(36).substr(2, 9),
        input,
        features,
        baseAssessment: assessment,
        resolve,
        reject
      }
      
      this.batchQueue.push(request)
      
      // Process immediately if batch is full
      if (this.batchQueue.length >= this.BATCH_SIZE) {
        this.processBatch()
      } else if (!this.batchTimer) {
        // Set timer for batch processing
        this.batchTimer = setTimeout(() => this.processBatch(), this.BATCH_DELAY)
      }
    })
  }
  
  /**
   * Process batch of requests efficiently
   */
  private async processBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    
    const batch = this.batchQueue.splice(0, this.BATCH_SIZE)
    if (batch.length === 0) return
    
    console.log(`📦 Processing batch of ${batch.length} AI insight requests`)
    
    try {
      // Process all requests in parallel
      const promises = batch.map(request => 
        this.generateSingleAIInsight(
          request.input,
          request.baseAssessment,
          request.features
        )
      )
      
      const results = await Promise.all(promises)
      
      // Resolve all promises
      batch.forEach((request, index) => {
        request.resolve(results[index])
      })
      
    } catch (error) {
      console.error('Batch processing error:', error)
      // Fallback to individual processing
      for (const request of batch) {
        try {
          const insights = await this.generateSingleAIInsight(
            request.input,
            request.baseAssessment,
            request.features
          )
          request.resolve(insights)
        } catch (err) {
          request.reject(err)
        }
      }
    }
  }
  
  /**
   * Generate single AI insight with optimized prompt
   */
  private async generateSingleAIInsight(
    input: AssessmentInput,
    assessment: AssessmentResult,
    features: DetailedFeatures
  ): Promise<AIInsights> {
    try {
      const systemPrompt = this.getOptimizedSystemPrompt()
      const userPrompt = this.buildOptimizedUserPrompt(features, assessment)
      
      const startTime = Date.now()
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        // Remove response_format to avoid JSON parsing issues
        // response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1200, // Reduced from 1500 for cost optimization
        top_p: 0.9,
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      })
      
      const processingTime = Date.now() - startTime
      console.log(`⚡ AI insights generated in ${processingTime}ms`)
      
      // Update metrics
      this.requestCount++
      const tokensUsed = response.usage?.total_tokens || 0
      this.totalTokens += tokensUsed
      this.totalCost += this.calculateCost(tokensUsed)
      
      const content = response.choices[0].message.content || '{}'
      
      // Attempt to parse JSON with error handling
      let insights: any = {}
      try {
        // Clean the content first - remove any markdown code blocks if present
        let cleanContent = content
        if (content.includes('```json')) {
          cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        } else if (content.includes('```')) {
          cleanContent = content.replace(/```\n?/g, '')
        }
        
        // Remove any trailing commas which can cause JSON parse errors
        cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1')
        
        // Parse the cleaned content
        insights = JSON.parse(cleanContent)
        
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.log('Raw AI response:', content.substring(0, 500))
        
        // Try to extract structured data even if JSON is malformed
        insights = this.extractStructuredData(content)
      }
      
      // Ensure all required fields exist
      return this.validateAndEnrichInsights(insights, features, assessment)
      
    } catch (error) {
      console.error('Error generating AI insights:', error)
      // Return fallback insights based on algorithm alone
      return this.generateFallbackInsights(features, assessment)
    }
  }
  
  /**
   * Extract structured data from malformed JSON response
   */
  private extractStructuredData(content: string): any {
    const result: any = {
      taskSpecificImpacts: [],
      uniqueStrengths: [],
      adaptationStrategies: {
        immediate: [],
        shortTerm: [],
        longTerm: []
      },
      industryContext: {},
      researchCitations: []
    }
    
    try {
      // Try to extract task impacts
      const taskMatch = content.match(/"taskSpecificImpacts"\s*:\s*\[(.*?)\]/s)
      if (taskMatch) {
        try {
          result.taskSpecificImpacts = JSON.parse(`[${taskMatch[1]}]`)
        } catch {}
      }
      
      // Try to extract unique strengths
      const strengthMatch = content.match(/"uniqueStrengths"\s*:\s*\[(.*?)\]/s)
      if (strengthMatch) {
        try {
          result.uniqueStrengths = JSON.parse(`[${strengthMatch[1]}]`)
        } catch {}
      }
      
      // Try to extract adaptation strategies
      const strategyMatch = content.match(/"adaptationStrategies"\s*:\s*\{(.*?)\}/s)
      if (strategyMatch) {
        try {
          result.adaptationStrategies = JSON.parse(`{${strategyMatch[1]}}`)
        } catch {}
      }
      
    } catch (extractError) {
      console.error('Data extraction error:', extractError)
    }
    
    return result
  }
  
  /**
   * Optimized system prompt (shorter, more focused)
   */
  private getOptimizedSystemPrompt(): string {
    return `Expert AI impact analyst with Microsoft Research data (200k conversations), Goldman Sachs projections (300M jobs, $7T impact), McKinsey (13% workforce transition by 2030), PwC (33% AI wage premium).

Provide specific, actionable insights in valid JSON format. Focus on concrete recommendations unique to this role. Be concise - max 150 words per section.

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or explanations.`
  }
  
  /**
   * Build optimized user prompt (reduced tokens)
   */
  private buildOptimizedUserPrompt(features: DetailedFeatures, assessment: AssessmentResult): string {
    // Truncate activities to save tokens
    const topActivities = features.specificActivities.slice(0, 3)
    const topSkills = features.technicalSkills.slice(0, 5)
    
    return `Role: ${features.jobTitle || 'Professional'}
Experience: ${features.yearsExperience}y
Skills: ${topSkills.join(', ') || 'Various'}
Level: ${features.managementLevel}
Risk: ${assessment.vulnerabilityIndex.overall}% (${assessment.vulnerabilityIndex.riskLevel})
Timeline: ${assessment.vulnerabilityIndex.timeToImpact}mo

Key tasks:
${topActivities.map(a => `- ${a.substring(0, 50)}`).join('\n')}

Return ONLY this JSON structure (no markdown, no code blocks):
{
  "taskSpecificImpacts": [
    {"task": "string", "currentMethod": "string", "aiMethod": "string", "impactPercentage": number, "timeframe": "string", "mitigation": "string"},
    {"task": "string", "currentMethod": "string", "aiMethod": "string", "impactPercentage": number, "timeframe": "string", "mitigation": "string"},
    {"task": "string", "currentMethod": "string", "aiMethod": "string", "impactPercentage": number, "timeframe": "string", "mitigation": "string"}
  ],
  "uniqueStrengths": [
    {"strength": "string", "whyItMatters": "string", "howToLeverage": "string"},
    {"strength": "string", "whyItMatters": "string", "howToLeverage": "string"},
    {"strength": "string", "whyItMatters": "string", "howToLeverage": "string"}
  ],
  "adaptationStrategies": {
    "immediate": ["action 1", "action 2"],
    "shortTerm": ["action 1", "action 2"],
    "longTerm": ["action 1", "action 2"]
  },
  "industryContext": {
    "trend": "string",
    "competitiveAdvantage": "string",
    "emergingRoles": ["role1", "role2", "role3"]
  },
  "researchCitations": [
    {"finding": "string", "source": "string", "relevance": "string"},
    {"finding": "string", "source": "string", "relevance": "string"},
    {"finding": "string", "source": "string", "relevance": "string"}
  ]
}`
  }
  
  /**
   * Calculate cost for tokens used
   */
  private calculateCost(tokens: number): number {
    // GPT-4o-mini pricing
    const inputCostPer1k = 0.00015
    const outputCostPer1k = 0.0006
    
    // Estimate: 60% input, 40% output
    const inputTokens = tokens * 0.6
    const outputTokens = tokens * 0.4
    
    return (inputTokens * inputCostPer1k / 1000) + (outputTokens * outputCostPer1k / 1000)
  }
  
  /**
   * Cache management
   */
  private getCachedInsights(key: string): AIInsights | null {
    const cached = this.insightCache.get(key)
    if (!cached) return null
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.insightCache.delete(key)
      return null
    }
    
    return cached.data
  }
  
  private setCachedInsights(key: string, insights: AIInsights): void {
    // Enforce max cache size
    if (this.insightCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.insightCache.keys().next().value
      if (firstKey !== undefined) {
        this.insightCache.delete(firstKey)
      }
    }
    
    this.insightCache.set(key, {
      data: insights,
      timestamp: Date.now()
    })
  }
  
  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of this.insightCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.insightCache.delete(key)
      }
    }
    console.log(`🧹 Cache cleanup: ${this.insightCache.size} entries remaining`)
  }
  
  /**
   * Generate cache key with better distribution
   */
  private generateCacheKey(content: string, features: DetailedFeatures): string {
    // Create a more specific cache key
    const keyParts = [
      features.jobTitle,
      features.yearsExperience,
      features.managementLevel,
      features.technicalSkills.slice(0, 3).join('-'),
      content.length
    ]
    
    // Simple hash
    let hash = 0
    const str = keyParts.join('|')
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return `ai_${hash}_${features.managementLevel}`
  }
  
  /**
   * Get metrics for monitoring
   */
  getMetrics() {
    return {
      requestCount: this.requestCount,
      cacheHits: this.cacheHits,
      cacheHitRate: this.requestCount > 0 ? (this.cacheHits / this.requestCount) : 0,
      totalTokens: this.totalTokens,
      totalCost: this.totalCost.toFixed(4),
      averageTokensPerRequest: this.requestCount > 0 ? Math.round(this.totalTokens / this.requestCount) : 0,
      cacheSize: this.insightCache.size,
      queueSize: this.batchQueue.length
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
    
    // Extract education level (using different method name to avoid conflict)
    const educationLevel = this.extractEducationLevel(content)
    
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
      const matches = Array.from(content.matchAll(pattern))
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
    const lower = content.toLowerCase()
    if (lower.includes('phd') || lower.includes('doctorate')) return 'PhD'
    if (lower.includes('master') || lower.includes('mba')) return 'Masters'
    if (lower.includes('bachelor') || lower.includes('bs') || lower.includes('ba')) return 'Bachelors'
    if (lower.includes('associate')) return 'Associates'
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
      const matches = Array.from(content.matchAll(pattern))
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
}

// Export enhanced engine with singleton pattern
let engineInstance: EnhancedAIAssessmentEngine | null = null

export const createEnhancedEngine = (apiKey: string) => {
  if (!engineInstance) {
    engineInstance = new EnhancedAIAssessmentEngine(apiKey)
  }
  return engineInstance
}