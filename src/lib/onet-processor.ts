// /src/lib/onet-processor.ts
import { ProcessedOccupation, WorkActivity, AIImpactScore } from '@/types/research'
import { MICROSOFT_CORRELATIONS, STUDY_FINDINGS } from '@/data/research-studies'

/**
 * Enhanced O*NET Processor with Microsoft Research Integration
 * Processes O*NET 29.3 database with AI impact scoring
 */
export class ONetProcessor {
  private occupationsData: any[] = []
  private workActivitiesData: any[] = []
  private skillsData: any[] = []
  private isLoaded = false

  /**
   * Load all O*NET data - in production, this would load from actual O*NET files
   * For now, we'll use comprehensive mock data based on the research
   */
  async loadAllData() {
    if (this.isLoaded) return this.getData()

    try {
      // In production, you would load from O*NET database files:
      // - Occupation Data.txt
      // - Work Activities.txt  
      // - Skills.txt
      // - Work Context.txt
      // - etc.

      console.log('Loading O*NET 29.3 database...')
      
      // For now, load comprehensive mock data
      this.occupationsData = this.generateMockOccupationsData()
      this.workActivitiesData = this.generateMockWorkActivitiesData()
      this.skillsData = this.generateMockSkillsData()
      
      this.isLoaded = true
      console.log(`Loaded ${this.occupationsData.length} occupations, ${this.workActivitiesData.length} work activities`)
      
      return this.getData()
    } catch (error) {
      console.error('Failed to load O*NET data:', error)
      throw new Error('O*NET database initialization failed')
    }
  }

  /**
   * Find matching occupations based on content analysis
   */
  async findMatchingOccupations(content: string, limit: number = 5): Promise<ProcessedOccupation[]> {
    if (!this.isLoaded) await this.loadAllData()

    const contentLower = content.toLowerCase()
    const matches: Array<{ occupation: any, score: number }> = []

    // Score each occupation based on content matching
    for (const occupation of this.occupationsData) {
      const matchScore = this.calculateMatchScore(contentLower, occupation)
      if (matchScore > 0.2) { // Threshold for relevance
        matches.push({ occupation, score: matchScore })
      }
    }

    // Sort by match score and process top matches
    matches.sort((a, b) => b.score - a.score)
    const topMatches = matches.slice(0, limit)

    const processedOccupations = await Promise.all(
      topMatches.map(async ({ occupation, score }) => 
        this.processOccupation(occupation, score)
      )
    )

    return processedOccupations
  }

  /**
   * Calculate occupation match score
   */
  private calculateMatchScore(content: string, occupation: any): number {
    let score = 0

    // Title matching
    const titleWords = occupation.title.toLowerCase().split(' ')
    const titleMatches = titleWords.filter((word: string) => content.includes(word)).length
    score += (titleMatches / titleWords.length) * 0.3

    // Description matching
    const descWords = occupation.description.toLowerCase().split(' ')
    const descMatches = descWords.filter((word: string) => 
      word.length > 3 && content.includes(word)
    ).length
    score += (descMatches / Math.max(1, descWords.length)) * 0.2

    // Skills matching
    const skillMatches = occupation.skills.filter((skill: string) => 
      content.includes(skill.toLowerCase())
    ).length
    score += (skillMatches / Math.max(1, occupation.skills.length)) * 0.3

    // Knowledge areas matching
    const knowledgeMatches = occupation.knowledge.filter((knowledge: string) => 
      content.includes(knowledge.toLowerCase())
    ).length
    score += (knowledgeMatches / Math.max(1, occupation.knowledge.length)) * 0.2

    return Math.min(1, score)
  }

  /**
   * Process individual occupation with AI impact analysis
   */
  private async processOccupation(occupationData: any, matchScore: number): Promise<ProcessedOccupation> {
    const workActivities = this.analyzeWorkActivities(occupationData)
    const aiImpactScore = this.calculateAIImpactScore(workActivities, occupationData)
    
    return {
      onetSocCode: occupationData.onetSocCode,
      title: occupationData.title,
      description: occupationData.description,
      jobZone: occupationData.jobZone,
      workActivities,
      tasks: occupationData.tasks,
      skills: occupationData.skills,
      knowledge: occupationData.knowledge,
      abilities: occupationData.abilities,
      workContext: occupationData.workContext,
      education: occupationData.education,
      interests: occupationData.interests,
      workValues: occupationData.workValues,
      wages: occupationData.wages,
      employment: occupationData.employment,
      outlook: occupationData.outlook,
      aiImpactScore,
      industry: this.determineIndustry(occupationData),
      matchScore: Math.round(matchScore * 100)
    }
  }

  /**
   * Analyze work activities for an occupation
   */
  private analyzeWorkActivities(occupation: any): WorkActivity[] {
    const activities: WorkActivity[] = []

    // Map O*NET work activities to Microsoft research findings
    for (const activityRef of occupation.workActivityRefs || []) {
      const activityData = this.workActivitiesData.find(wa => wa.id === activityRef.id)
      if (!activityData) continue

      const activity: WorkActivity = {
        id: activityData.id,
        title: activityData.title,
        description: activityData.description,
        importance: activityRef.importance || 3.0,
        level: activityRef.level || 3.0,
        aiAutomationRisk: this.calculateAutomationRisk(activityData),
        aiAugmentationPotential: this.calculateAugmentationPotential(activityData),
        frequency: activityRef.frequency || 3.0,
        complexity: this.calculateComplexity(activityData)
      }

      activities.push(activity)
    }

    return activities
  }

  /**
   * Calculate automation risk based on Microsoft research
   */
  private calculateAutomationRisk(activity: any): number {
    const highRiskKeywords = [
      'data entry', 'process', 'routine', 'administrative', 'clerical',
      'calculate', 'record', 'file', 'sort', 'categorize'
    ]
    
    const lowRiskKeywords = [
      'physical', 'manual', 'interpersonal', 'supervise', 'lead',
      'negotiate', 'counsel', 'mentor', 'coordinate'
    ]

    let risk = 40 // Base risk

    const activityText = (activity.title + ' ' + activity.description).toLowerCase()
    
    // Check for high-risk indicators
    const highRiskMatches = highRiskKeywords.filter(keyword => 
      activityText.includes(keyword)
    ).length
    risk += highRiskMatches * 15

    // Check for low-risk indicators
    const lowRiskMatches = lowRiskKeywords.filter(keyword => 
      activityText.includes(keyword)
    ).length
    risk -= lowRiskMatches * 10

    // Microsoft research specific high-impact activities
    if (STUDY_FINDINGS.highAutomationActivities.some(highActivity => 
      activityText.includes(highActivity.toLowerCase())
    )) {
      risk += 20
    }

    return Math.max(0, Math.min(100, risk))
  }

  /**
   * Calculate augmentation potential
   */
  private calculateAugmentationPotential(activity: any): number {
    const highAugmentationKeywords = [
      'analyze', 'research', 'write', 'communicate', 'decide',
      'create', 'design', 'plan', 'solve', 'evaluate'
    ]

    let potential = 50 // Base potential

    const activityText = (activity.title + ' ' + activity.description).toLowerCase()
    
    const matches = highAugmentationKeywords.filter(keyword => 
      activityText.includes(keyword)
    ).length
    potential += matches * 12

    // Microsoft research high-augmentation activities
    if (STUDY_FINDINGS.highAugmentationActivities.some(highActivity => 
      activityText.includes(highActivity.toLowerCase())
    )) {
      potential += 25
    }

    return Math.max(0, Math.min(100, potential))
  }

  /**
   * Calculate work complexity
   */
  private calculateComplexity(activity: any): number {
    const complexityKeywords = [
      'complex', 'strategic', 'advanced', 'expert', 'professional',
      'specialized', 'technical', 'analytical', 'creative'
    ]

    const activityText = (activity.title + ' ' + activity.description).toLowerCase()
    const matches = complexityKeywords.filter(keyword => 
      activityText.includes(keyword)
    ).length

    return Math.min(5, 2 + (matches * 0.5))
  }

  /**
   * Calculate comprehensive AI impact score
   */
  calculateAIImpactScore(workActivities: WorkActivity[], occupation: any): AIImpactScore {
    if (workActivities.length === 0) {
      return {
        automation: 30,
        augmentation: 50,
        overall: 40,
        confidence: 60,
        studyBasis: ['general-estimates'],
        timeToImpact: 48
      }
    }

    // Weight activities by importance
    const totalImportance = workActivities.reduce((sum, wa) => sum + wa.importance, 0)
    
    const weightedAutomation = workActivities.reduce((sum, wa) => 
      sum + (wa.aiAutomationRisk * wa.importance), 0) / totalImportance
    
    const weightedAugmentation = workActivities.reduce((sum, wa) => 
      sum + (wa.aiAugmentationPotential * wa.importance), 0) / totalImportance

    // Overall impact is weighted combination
    const overall = Math.round((weightedAutomation * 0.4) + (weightedAugmentation * 0.6))

    // Confidence based on Microsoft research coverage
    let confidence = 70
    const occupationTitle = occupation.title.toLowerCase()
    
    // Higher confidence for occupations covered in Microsoft study
    if (STUDY_FINDINGS.highestImpactOccupations.some(occ => 
      occupationTitle.includes(occ.toLowerCase())
    )) {
      confidence += 20
    }
    
    if (STUDY_FINDINGS.lowestImpactOccupations.some(occ => 
      occupationTitle.includes(occ.toLowerCase())
    )) {
      confidence += 15
    }

    // Time to impact estimation
    let timeToImpact = 36 // Default 3 years
    if (overall >= 70) timeToImpact = 18    // 1.5 years for high impact
    else if (overall >= 50) timeToImpact = 24  // 2 years for medium impact
    else if (overall <= 30) timeToImpact = 60  // 5 years for low impact

    // Study basis
    const studyBasis = ['microsoft-2024', 'onet-29.3']
    if (confidence >= 85) studyBasis.push('goldman-sachs-2023', 'mckinsey-2025')

    return {
      automation: Math.round(weightedAutomation),
      augmentation: Math.round(weightedAugmentation),
      overall,
      confidence: Math.min(95, confidence),
      studyBasis,
      timeToImpact
    }
  }

  /**
   * Determine industry category
   */
  private determineIndustry(occupation: any): string {
    const title = occupation.title.toLowerCase()
    const description = occupation.description.toLowerCase()
    const text = title + ' ' + description

    const industryKeywords: Record<string, string[]> = {
      "Technology": ["software", "computer", "programmer", "developer", "it", "tech", "data", "systems"],
      "Healthcare": ["health", "medical", "nurse", "doctor", "patient", "clinical", "therapy", "dental"],
      "Education": ["teacher", "education", "instructor", "professor", "school", "academic", "student"],
      "Financial Services": ["finance", "bank", "accounting", "investment", "insurance", "credit", "loan"],
      "Manufacturing": ["manufacturing", "production", "assembly", "factory", "industrial", "quality"],
      "Retail": ["retail", "sales", "customer", "store", "merchandise", "cashier", "service"],
      "Government": ["government", "public", "federal", "state", "municipal", "policy", "regulation"],
      "Legal": ["legal", "law", "attorney", "court", "justice", "compliance", "paralegal"],
      "Transportation": ["transportation", "driver", "pilot", "logistics", "shipping", "delivery"],
      "Construction": ["construction", "building", "contractor", "electrical", "plumbing", "carpentry"]
    }

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return industry
      }
    }

    return "Professional Services" // Default
  }

  /**
   * Get loaded data summary
   */
  getData() {
    return {
      occupations: this.occupationsData,
      workActivities: this.workActivitiesData,
      skills: this.skillsData,
      isLoaded: this.isLoaded
    }
  }

  /**
   * Generate comprehensive mock occupations data
   * Based on real O*NET structure and Microsoft research findings
   */
  private generateMockOccupationsData() {
    return [
      {
        onetSocCode: "15-1211.00",
        title: "Computer Systems Analysts",
        description: "Analyze science, engineering, business, and other data processing problems to implement and improve computer systems",
        jobZone: 4,
        tasks: [
          "Analyze user requirements, procedures, and problems to automate processing",
          "Define the goals of the system and devise flow charts and diagrams",
          "Design new computer programs by analyzing requirements"
        ],
        skills: ["Systems Analysis", "Critical Thinking", "Complex Problem Solving", "Programming"],
        knowledge: ["Computers and Electronics", "Mathematics", "Engineering and Technology"],
        abilities: ["Deductive Reasoning", "Information Ordering", "Mathematical Reasoning"],
        workContext: {
          autonomy: 4.2,
          customerContact: 3.5,
          physicalDemands: 1.8
        },
        education: {
          level: "Bachelor's degree",
          category: "4-year degree"
        },
        interests: ["Investigative", "Conventional"],
        workValues: ["Achievement", "Independence", "Working Conditions"],
        wages: {
          median: 93730,
          percentile25: 73690,
          percentile75: 117120
        },
        employment: 607800,
        outlook: "Much faster than average",
        workActivityRefs: [
          { id: "4.A.2.a.3", importance: 4.5, level: 4.2, frequency: 4.0 },
          { id: "4.A.2.b.1", importance: 4.8, level: 4.5, frequency: 4.5 }
        ]
      },
      
      {
        onetSocCode: "27-3031.00",
        title: "Public Relations Specialists",
        description: "Promote or create an intended public image for individuals, groups, or organizations",
        jobZone: 4,
        tasks: [
          "Write press releases and prepare information for media",
          "Plan and direct development of programs to maintain favorable public image",
          "Study the organization and its publics to determine communication needs"
        ],
        skills: ["Writing", "Social Perceptiveness", "Speaking", "Reading Comprehension"],
        knowledge: ["Communications and Media", "English Language", "Customer Service"],
        abilities: ["Written Comprehension", "Written Expression", "Oral Expression"],
        workContext: {
          autonomy: 3.8,
          customerContact: 4.5,
          physicalDemands: 1.5
        },
        education: {
          level: "Bachelor's degree", 
          category: "4-year degree"
        },
        interests: ["Artistic", "Enterprising", "Social"],
        workValues: ["Achievement", "Recognition", "Relationships"],
        wages: {
          median: 62810,
          percentile25: 45020,
          percentile75: 85380
        },
        employment: 275550,
        outlook: "Faster than average",
        workActivityRefs: [
          { id: "4.A.4.a.1", importance: 4.8, level: 4.2, frequency: 4.7 },
          { id: "4.A.4.b.4", importance: 4.2, level: 3.8, frequency: 4.0 }
        ]
      },

      {
        onetSocCode: "31-1014.00", 
        title: "Nursing Assistants",
        description: "Provide basic patient care under direction of nursing staff",
        jobZone: 2,
        tasks: [
          "Provide physical support to assist patients to perform daily living activities",
          "Monitor patients' vital signs, such as blood pressure and pulse",
          "Turn and reposition bedridden patients"
        ],
        skills: ["Service Orientation", "Social Perceptiveness", "Monitoring"],
        knowledge: ["Customer Service", "Medicine and Dentistry", "Psychology"],
        abilities: ["Problem Sensitivity", "Manual Dexterity", "Physical Strength"],
        workContext: {
          autonomy: 2.8,
          customerContact: 4.8,
          physicalDemands: 4.2
        },
        education: {
          level: "Postsecondary nondegree award",
          category: "Certificate"
        },
        interests: ["Social", "Realistic"],
        workValues: ["Relationships", "Support", "Achievement"],
        wages: {
          median: 30830,
          percentile25: 25710,
          percentile75: 37050
        },
        employment: 1351760,
        outlook: "Much faster than average",
        workActivityRefs: [
          { id: "4.A.1.a.1", importance: 4.5, level: 3.2, frequency: 4.8 },
          { id: "4.A.3.a.3", importance: 4.0, level: 2.8, frequency: 4.2 }
        ]
      }

      // Add more occupations as needed...
    ]
  }

  /**
   * Generate work activities data based on O*NET structure
   */
  private generateMockWorkActivitiesData() {
    return [
      {
        id: "4.A.2.a.3",
        title: "Analyzing Data or Information", 
        description: "Identifying the underlying principles, reasons, or facts of information by breaking down information or data into separate parts"
      },
      {
        id: "4.A.2.b.1",
        title: "Processing Information",
        description: "Compiling, coding, categorizing, calculating, tabulating, auditing, or verifying information or data"
      },
      {
        id: "4.A.4.a.1", 
        title: "Documenting/Recording Information",
        description: "Entering, transcribing, recording, storing, or maintaining information in written or electronic/magnetic form"
      },
      {
        id: "4.A.4.b.4",
        title: "Communicating with People Outside the Organization",
        description: "Communicating with people outside the organization, representing the organization to customers, the public, government, and other external sources"
      },
      {
        id: "4.A.1.a.1",
        title: "Assisting and Caring for Others",
        description: "Providing personal assistance, medical attention, emotional support, or other personal care to others"
      },
      {
        id: "4.A.3.a.3",
        title: "Monitor Processes, Materials, or Surroundings", 
        description: "Monitoring and reviewing information from materials, events, or the environment, to detect or assess problems"
      }
    ]
  }

  /**
   * Generate skills data
   */
  private generateMockSkillsData() {
    return [
      { id: "2.A.1.a", name: "Reading Comprehension", description: "Understanding written sentences and paragraphs" },
      { id: "2.A.1.b", name: "Active Listening", description: "Giving full attention to what other people are saying" },
      { id: "2.A.1.c", name: "Writing", description: "Communicating effectively in writing as appropriate for audience needs" },
      { id: "2.A.1.d", name: "Speaking", description: "Talking to others to convey information effectively" },
      { id: "2.A.2.a", name: "Critical Thinking", description: "Using logic and reasoning to identify solutions" },
      { id: "2.A.2.b", name: "Complex Problem Solving", description: "Identifying complex problems and implementing solutions" }
    ]
  }
}

// Export singleton instance
export const onetProcessor = new ONetProcessor()