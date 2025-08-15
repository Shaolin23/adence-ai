// /src/lib/config.ts
/**
 * Application Configuration
 * Environment variables and constants
 */

export const config = {
  // API Configuration
  api: {
    version: '1.0.0',
    timeout: 30000, // 30 seconds
    rateLimit: {
      requests: 100,
      window: 3600000 // 1 hour
    }
  },

  // Assessment Configuration
  assessment: {
    maxContentLength: 50000,
    minContentLength: 50,
    maxOccupationMatches: 5,
    confidenceThreshold: 0.7,
    microsoftStudyWeight: 0.4,
    onetDataWeight: 0.3,
    economicStudiesWeight: 0.3
  },

  // Research Data Sources
  research: {
    microsoftStudy: {
      conversations: 200000,
      occupations: 900,
      workActivities: 332,
      reliability: 0.91
    },
    onetVersion: '29.3',
    economicStudies: [
      'Goldman Sachs 2023',
      'PwC 2025', 
      'McKinsey 2025',
      'WEF 2025'
    ]
  },

  // Payment Configuration
  payment: {
    individualPrice: 2900, // $29.00 in cents
    businessPrice: 4900,   // $49.00 in cents
    currency: 'usd',
    successUrl: '/payment/success',
    cancelUrl: '/payment/cancel'
  },

  // PDF Configuration
  pdf: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    quality: 'high',
    includeCharts: true,
    includeCitations: true
  },

  // Feature Flags
  features: {
    enhancedMatching: true,
    geographicAnalysis: true,
    industryBenchmarking: true,
    timelineProjections: true,
    microsoftDataIntegration: true,
    economicProjections: true
  }
}

// Environment Configuration
export const env = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API Keys (from environment variables)
  stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  
  // Database (if using)
  databaseUrl: process.env.DATABASE_URL,
  
  // Analytics
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  
  // Deployment
  vercelUrl: process.env.VERCEL_URL,
  baseUrl: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
}

// Validation
export function validateConfig() {
  const errors: string[] = []
  
  if (env.isProduction) {
    if (!env.stripeSecretKey) {
      errors.push('STRIPE_SECRET_KEY is required in production')
    }
    if (!env.stripePublicKey) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in production')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`)
  }
}

// Initialize configuration
if (typeof window === 'undefined') {
  // Server-side only
  try {
    validateConfig()
  } catch (error) {
    console.error('Configuration validation failed:', error)
    if (env.isProduction) {
      throw error
    }
  }
}