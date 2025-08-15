// /src/data/research-studies.ts
/**
 * Research Studies Data Foundation
 * Based on Microsoft Research + Major Economic Studies
 */

export const RESEARCH_STUDIES = {
  microsoft2024: {
    title: "Working with AI: Measuring the Occupational Implications of Generative AI",
    authors: ["Kiran Tomlinson", "Sonia Jaffe", "Will Wang", "Scott Counts", "Siddharth Suri"],
    institution: "Microsoft Research",
    year: 2024,
    dataPoints: 200000,
    conversationAnalysis: true,
    occupationsCovered: 900,
    workActivities: 332,
    reliability: 0.91,
    correlation: {
      eloundouPredictions: 0.73,
      majorGroupLevel: 0.91
    }
  },
  
  goldmanSachs2023: {
    title: "Generative AI could raise global GDP by 7%",
    institution: "Goldman Sachs Global Investment Research", 
    year: 2023,
    economicImpact: 7000000000000, // $7 trillion
    jobsAffected: 300000000, // 300 million
    automationPotential: {
      us: 0.25,
      europe: 0.22,
      global: 0.18
    },
    timeline: "2030-2040"
  },
  
  pwc2025: {
    title: "AI Jobs Barometer: 33% wage premium for AI skills",
    institution: "PricewaterhouseCoopers",
    year: 2025,
    wagePremium: 0.33,
    adoptionRate: 0.85,
    skillsGapSeverity: "critical",
    industryLeaders: ["Technology", "Financial Services", "Professional Services"]
  },
  
  mckinsey2025: {
    title: "The Future of Work: Automation and the changing nature of work",
    institution: "McKinsey Global Institute",
    year: 2025,
    workforceTransition: 0.13, // 13% need career changes
    newJobsCreated: 97000000, // 97 million new jobs
    automationPotential: 0.45,
    augmentationPotential: 0.65,
    timeline: "2025-2030"
  },
  
  wef2025: {
    title: "Future of Jobs Report: AI transformation effects",
    institution: "World Economic Forum",
    year: 2025,
    jobsDisplaced: 85000000,
    jobsCreated: 97000000,
    netJobCreation: 12000000,
    skillsTransition: "urgent"
  }
}

export const STUDY_FINDINGS = {
  // Microsoft study key findings
  topUserGoals: [
    "Gathering information",
    "Writing and editing", 
    "Communicating with others"
  ],
  
  topAIActions: [
    "Providing information and assistance",
    "Teaching and coaching",
    "Advising and consulting"
  ],
  
  highestImpactOccupations: [
    "Interpreters and Translators",
    "Writers and Authors", 
    "Customer Service Representatives",
    "Sales Representatives",
    "Technical Writers"
  ],
  
  lowestImpactOccupations: [
    "Nursing Assistants",
    "Massage Therapists",
    "Water Treatment Plant Operators",
    "Dishwashers",
    "Roofers"
  ],
  
  // Work activities with highest automation potential
  highAutomationActivities: [
    "Processing Information",
    "Analyzing Data or Information", 
    "Getting Information",
    "Documenting/Recording Information",
    "Working with Computers"
  ],
  
  // Work activities with highest augmentation potential
  highAugmentationActivities: [
    "Making Decisions and Solving Problems",
    "Thinking Creatively",
    "Updating and Using Relevant Knowledge",
    "Communicating with People Outside Organization",
    "Providing Consultation and Advice"
  ],
  
  // Industry adoption rates from multiple studies
  industryAIReadiness: {
    technology: { adoption: 0.85, maturity: "advanced", timeline: 12 },
    financialServices: { adoption: 0.72, maturity: "intermediate", timeline: 18 },
    healthcare: { adoption: 0.45, maturity: "early", timeline: 24 },
    education: { adoption: 0.38, maturity: "early", timeline: 30 },
    manufacturing: { adoption: 0.55, maturity: "intermediate", timeline: 24 },
    retail: { adoption: 0.42, maturity: "early", timeline: 36 },
    government: { adoption: 0.25, maturity: "nascent", timeline: 48 }
  },
  
  // Geographic AI readiness (multiple sources)
  geographicReadiness: {
    northAmerica: { us: 78, canada: 75 },
    europe: { uk: 74, germany: 73, france: 69, nordics: 76 },
    asia: { china: 85, japan: 68, southKorea: 82, singapore: 88, india: 62 },
    oceania: { australia: 70, newZealand: 68 }
  },
  
  // Skills in highest demand (PwC + McKinsey)
  futureSkills: {
    technical: [
      "AI/ML literacy",
      "Data analysis",
      "Programming/automation",
      "Digital collaboration tools",
      "Cybersecurity awareness"
    ],
    human: [
      "Complex problem solving",
      "Creative thinking", 
      "Emotional intelligence",
      "Leadership and influence",
      "Cultural awareness and sensitivity"
    ],
    hybrid: [
      "Human-AI collaboration",
      "AI system design and oversight",
      "Ethical AI decision making",
      "AI-augmented creativity",
      "Cross-functional AI integration"
    ]
  }
}

// Microsoft research correlation data
export const MICROSOFT_CORRELATIONS = {
  // Correlation with Eloundou et al. predictions
  occupationLevel: 0.73,
  majorGroupLevel: 0.91,
  
  // Success metrics
  taskCompletion: {
    writingTasks: 0.85,
    informationGathering: 0.82,
    dataAnalysis: 0.65,
    creativeWork: 0.58,
    physicalTasks: 0.12
  },
  
  // User satisfaction by activity type
  satisfactionRates: {
    "Edit written materials": 0.89,
    "Research information": 0.87,
    "Write content": 0.84,
    "Explain concepts": 0.82,
    "Analyze data": 0.67,
    "Create visuals": 0.45
  }
}

// Economic impact projections
export const ECONOMIC_PROJECTIONS = {
  goldmanSachs: {
    globalGDPImpact: 7000000000000, // $7 trillion
    usProductivityGain: 0.25,
    europeProductivityGain: 0.22,
    timeline: "2030-2040"
  },
  
  mckinsey: {
    automationPotential: 0.45,
    augmentationPotential: 0.65,
    workforceTransition: 0.13,
    newJobsCreated: 97000000,
    timeline: "2025-2030"
  },
  
  pwc: {
    wagePremiumAI: 0.33,
    adoptionRate2025: 0.85,
    skillsGapUrgency: "critical",
    investmentNeeded: 100000000000 // $100 billion in reskilling
  }
}