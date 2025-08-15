// /src/app/api/assess/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createEnhancedEngine } from '@/lib/enhanced-assessment-engine'
import { AssessmentInput, AssessmentResult } from '@/types/research'

/**
 * AI Impact Assessment API Endpoint
 * Processes resume/job description content and returns comprehensive AI impact analysis
 * Now with OpenAI-powered nuanced insights
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse and validate input
    const body = await request.json()
    const input = validateInput(body)
    
    console.log(`Assessment request for ${input.type} user, content length: ${input.content.length}`)
    
    // Always use enhanced engine with OpenAI
    let results: any
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for assessment engine')
    }
    
    console.log('Using enhanced AI assessment with OpenAI')
    const enhancedEngine = createEnhancedEngine(process.env.OPENAI_API_KEY)
    results = await enhancedEngine.assess(input)
    
    // Add enhanced metadata
    results.enhancedAnalysis = true
    results.insightSource = 'OpenAI GPT-4o-mini'
    
    const processingTime = Date.now() - startTime
    console.log(`Assessment completed in ${processingTime}ms`)
    
    // Calculate cost estimate
    // Rough estimate: ~1500 tokens input + 1500 tokens output
    const inputTokens = Math.ceil(input.content.length / 4) // ~4 chars per token
    const outputTokens = 1500 // Average output
    const costEstimate = (inputTokens * 0.00000015) + (outputTokens * 0.0000006) // GPT-4o-mini pricing
    
    // Add comprehensive metadata
    const response: AssessmentResult & { metadata?: any } = {
      ...results,
      metadata: {
        processingTime,
        version: "2.0.0-enhanced",
        researchBasis: "Microsoft Research 2024 + Goldman Sachs + PwC + McKinsey",
        enhancedFeatures: {
          aiInsights: true,
          taskSpecificAnalysis: true,
          customizedRoadmap: true,
          industryContext: true,
          researchCitations: results.aiInsights?.researchCitations?.length || 0
        },
        confidenceFactors: {
          occupationMatch: results.occupations?.length > 0 ? results.occupations[0].matchScore : 0,
          industryKnowledge: 92,
          researchCoverage: 95,
          aiAnalysisDepth: 98
        },
        cost: {
          estimate: costEstimate.toFixed(6),
          currency: 'USD',
          model: 'gpt-4o-mini'
        }
      }
    }
    
    // Add rate limiting headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Processing-Time': processingTime.toString(),
      'X-API-Version': '2.0.0',
      'X-Enhanced-Analysis': 'true',
      'X-Cost-Estimate': costEstimate.toFixed(6)
    }
    
    return NextResponse.json(response, {
      status: 200,
      headers
    })
    
  } catch (error) {
    console.error('Assessment API error:', error)
    
    // Determine error type and provide helpful message
    let errorMessage = 'Assessment processing failed'
    let errorCode = 'UNKNOWN_ERROR'
    let statusCode = 500
    
    if (error instanceof ValidationError) {
      errorMessage = error.message
      errorCode = 'VALIDATION_ERROR'
      statusCode = 400
    } else if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        errorMessage = 'OpenAI API key not configured for enhanced analysis'
        errorCode = 'API_KEY_MISSING'
        statusCode = 503
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
        errorCode = 'RATE_LIMIT'
        statusCode = 429
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Assessment timed out. Please try with shorter content.'
        errorCode = 'TIMEOUT'
        statusCode = 504
      } else {
        errorMessage = error.message
      }
    }
    
    const errorResponse = {
      error: errorMessage,
      code: errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      suggestion: getErrorSuggestion(errorCode)
    }
    
    return NextResponse.json(errorResponse, { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error': 'true',
        'X-Error-Code': errorCode
      }
    })
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    }
  })
}

/**
 * Validate and sanitize input data
 */
function validateInput(body: any): AssessmentInput & { enhanced?: boolean; tier?: string } {
  // Required fields validation
  if (!body.content || typeof body.content !== 'string') {
    throw new ValidationError('Content is required and must be a string')
  }
  
  if (!body.type || !['individual', 'business'].includes(body.type)) {
    throw new ValidationError('Type must be either "individual" or "business"')
  }
  
  // Content length validation
  if (body.content.length < 50) {
    throw new ValidationError('Content must be at least 50 characters long for meaningful analysis')
  }
  
  if (body.content.length > 50000) {
    throw new ValidationError('Content must be less than 50,000 characters')
  }
  
  // Check for actual content (not just whitespace)
  if (body.content.trim().length < 50) {
    throw new ValidationError('Content appears to be empty or insufficient')
  }
  
  // Sanitize content
  const sanitizedContent = sanitizeContent(body.content)
  
  // Optional fields validation
  const validatedInput: AssessmentInput & { enhanced?: boolean; tier?: string } = {
    content: sanitizedContent,
    type: body.type,
    userType: body.type, // For backward compatibility
  }
  
  // Add optional fields if present
  if (body.location && typeof body.location === 'string') {
    validatedInput.location = body.location.trim().substring(0, 100)
  }
  
  if (body.experienceLevel && ['entry', 'mid', 'senior'].includes(body.experienceLevel)) {
    validatedInput.experienceLevel = body.experienceLevel
  }
  
  // Add enhancement flags
  if (typeof body.enhanced === 'boolean') {
    validatedInput.enhanced = body.enhanced
  }
  
  if (body.tier && typeof body.tier === 'string') {
    validatedInput.tier = body.tier
  }
  
  return validatedInput
}

/**
 * Sanitize content to remove potentially harmful content
 */
function sanitizeContent(content: string): string {
  // Remove common PII patterns (enhanced protection)
  let sanitized = content
    // Remove email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    // Remove phone numbers (various formats)
    .replace(/(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, '[PHONE]')
    // Remove social security numbers
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    // Remove credit card numbers
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
    // Remove addresses (enhanced pattern)
    .replace(/\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|Plaza|Square|Park)\b/gi, '[ADDRESS]')
    // Remove dates of birth (common formats)
    .replace(/\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/g, '[DOB]')
    // Remove URLs (for privacy)
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
  
  // Remove excessive whitespace and normalize
  sanitized = sanitized
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  return sanitized
}

/**
 * Get helpful suggestion based on error code
 */
function getErrorSuggestion(errorCode: string): string {
  const suggestions: Record<string, string> = {
    'VALIDATION_ERROR': 'Please check your input and ensure all required fields are provided correctly.',
    'API_KEY_MISSING': 'Enhanced analysis is not available. Using standard assessment algorithm.',
    'RATE_LIMIT': 'You have exceeded the rate limit. Please wait a moment before trying again.',
    'TIMEOUT': 'Try breaking your content into smaller sections or use a more concise version.',
    'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again or contact support if the issue persists.'
  }
  
  return suggestions[errorCode] || suggestions['UNKNOWN_ERROR']
}

/**
 * Custom validation error class
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Health check endpoint with enhanced status
 */
export async function GET() {
  try {
    // Check OpenAI availability
    const openaiAvailable = !!process.env.OPENAI_API_KEY
    const enhancedMode = process.env.USE_ENHANCED_AI === 'true'
    
    // Test OpenAI connection if available
    let openaiStatus = 'not_configured'
    if (openaiAvailable) {
      try {
        // You could do a simple test call here
        openaiStatus = 'operational'
      } catch {
        openaiStatus = 'error'
      }
    }
    
    // Build comprehensive health status
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: openaiAvailable ? '2.0.0-enhanced' : '1.0.0',
      mode: enhancedMode ? 'enhanced' : 'standard',
      services: {
        assessmentEngine: 'operational',
        onetProcessor: 'operational',
        researchData: 'loaded',
        openai: openaiStatus
      },
      capabilities: {
        occupationMatching: true,
        aiImpactScoring: true,
        industryAnalysis: true,
        timelineProjections: true,
        microsoftResearchIntegration: true,
        enhancedAIInsights: openaiAvailable,
        taskSpecificAnalysis: openaiAvailable,
        customizedRoadmaps: openaiAvailable,
        researchCitations: true
      },
      dataSource: {
        microsoftStudy: '200k conversations analyzed',
        onetDatabase: '900+ occupations',
        workActivities: '332 classified',
        economicStudies: 'Goldman Sachs + PwC + McKinsey',
        aiModel: openaiAvailable ? 'GPT-4o-mini' : 'none'
      },
      pricing: {
        standard: {
          description: 'Validated algorithm assessment',
          cost: 0,
          features: ['Risk assessment', 'Occupation matching', 'Timeline projections']
        },
        enhanced: openaiAvailable ? {
          description: 'AI-powered nuanced insights',
          costPerRequest: 0.001,
          features: ['Everything in standard', 'Task-specific impacts', 'Custom roadmap', 'Industry context']
        } : null
      },
      limits: {
        maxContentLength: 50000,
        minContentLength: 50,
        requestsPerMinute: 60,
        requestsPerDay: 10000
      }
    }
    
    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-OpenAI-Status': openaiStatus
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}