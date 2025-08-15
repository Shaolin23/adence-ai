// /src/app/assess/page.tsx
'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import { AssessmentInput, EnhancedAssessmentResult } from '@/types/research'

// Debug flag - set to false in production
const DEBUG_MODE = false

export default function AssessPage() {
  const [assessmentData, setAssessmentData] = useState<Partial<AssessmentInput>>({
    content: '',
    type: 'individual'
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<EnhancedAssessmentResult | null>(null)
  const [error, setError] = useState<string>('')

  // Debug log on mount
  useEffect(() => {
    console.log('🚀 Enhanced Assess Page Mounted - Version 2.0')
  }, [])

  const handleFileProcessed = (content: string) => {
    setAssessmentData(prev => ({ 
      ...prev, 
      content,
    }))
    setError('')
  }

  const handleTextChange = (content: string) => {
    setAssessmentData(prev => ({ ...prev, content }))
    setError('')
  }

  const handleUserTypeChange = (type: 'individual' | 'business') => {
    setAssessmentData(prev => ({ ...prev, type }))
  }

  const handleAnalyze = async () => {
    if (!assessmentData.content || assessmentData.content.length < 50) {
      setError('Please provide at least 50 characters of content to analyze')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: assessmentData.content,
          type: assessmentData.type || 'individual'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Analysis failed: ${response.statusText}`)
      }

      const result: EnhancedAssessmentResult = await response.json()
      
      // Debug logging
      console.log('📊 Full assessment results received:', result)
      console.log('🎯 AI Insights present:', !!result.aiInsights)
      console.log('🔍 Enhanced Analysis flag:', result.enhancedAnalysis)
      
      setResults(result)
    } catch (error) {
      console.error('Assessment error:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // RESULTS DISPLAY
  if (results) {
    const hasEnhancedInsights = !!(results.aiInsights && 
      (results.aiInsights.taskSpecificImpacts?.length > 0 ||
       results.aiInsights.uniqueStrengths?.length > 0 ||
       results.aiInsights.adaptationStrategies ||
       results.aiInsights.industryContext))
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
              <button
                onClick={() => {
                  setResults(null)
                  setAssessmentData({ content: '', type: 'individual' })
                }}
                className="text-white hover:text-blue-100 mb-4 flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">New Analysis</span>
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    AI Impact Assessment Results
                  </h1>
                  {results.confidenceScore && (
                    <p className="text-blue-100 mt-2">
                      Confidence Score: {results.confidenceScore}%
                    </p>
                  )}
                </div>
                {hasEnhancedInsights && (
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Enhanced with AI Insights
                  </div>
                )}
              </div>
            </div>

            {/* DEBUG PANEL */}
            {DEBUG_MODE && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 p-4 m-4 rounded-lg">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">🔍 Debug Information</h3>
                <div className="text-xs font-mono space-y-1 text-yellow-700 dark:text-yellow-300">
                  <p>Enhanced Analysis: {String(results.enhancedAnalysis)}</p>
                  <p>Has AI Insights: {String(!!results.aiInsights)}</p>
                  <p>Specific Risk Factors: {results.specificRiskFactors?.length || 0}</p>
                  <p>Protective Factors: {results.protectiveFactors?.length || 0}</p>
                  <p>Customized Roadmap: {results.customizedRoadmap?.length || 0}</p>
                  {results.aiInsights && (
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-800/20 rounded">
                      <p>Task Impacts: {results.aiInsights.taskSpecificImpacts?.length || 0}</p>
                      <p>Unique Strengths: {results.aiInsights.uniqueStrengths?.length || 0}</p>
                      <p>Has Strategies: {String(!!results.aiInsights.adaptationStrategies)}</p>
                      <p>Has Context: {String(!!results.aiInsights.industryContext)}</p>
                      <p>Citations: {results.aiInsights.researchCitations?.length || 0}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Level Card */}
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold shadow-lg ${
                  results.vulnerabilityIndex.riskLevel === 'critical' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                    : results.vulnerabilityIndex.riskLevel === 'high' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : results.vulnerabilityIndex.riskLevel === 'medium' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                }`}>
                  <span className="mr-3">Risk Level:</span>
                  <span className="text-xl">{results.vulnerabilityIndex.riskLevel.toUpperCase()}</span>
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {results.vulnerabilityIndex.overall}% Overall Score
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="mt-6 space-y-6">
            {/* AI TASK-SPECIFIC IMPACTS */}
            {results.aiInsights?.taskSpecificImpacts && results.aiInsights.taskSpecificImpacts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    AI Analysis: Task-Specific Impacts
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {results.aiInsights.taskSpecificImpacts.map((impact, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg pr-2">
                            {impact.task}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${
                            impact.impactPercentage >= 70 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : impact.impactPercentage >= 40 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {impact.impactPercentage}% Impact
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Current:</span>
                            <p className="text-gray-800 dark:text-gray-200 mt-1">{impact.currentMethod}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">With AI:</span>
                            <p className="text-gray-800 dark:text-gray-200 mt-1">{impact.aiMethod}</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                            <span className="font-semibold text-blue-900 dark:text-blue-300">Mitigation: </span>
                            <span className="text-blue-800 dark:text-blue-200">{impact.mitigation}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Timeline: {impact.timeframe}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* UNIQUE STRENGTHS */}
            {results.aiInsights?.uniqueStrengths && results.aiInsights.uniqueStrengths.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Your Unique AI-Resistant Strengths
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                    {results.aiInsights.uniqueStrengths.map((strength, index) => (
                      <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-700">
                        <h4 className="font-bold text-green-800 dark:text-green-300 text-lg mb-3">
                          {strength.strength}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                          {strength.whyItMatters}
                        </p>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                          <span className="font-semibold text-green-700 dark:text-green-400 text-sm">How to leverage: </span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                            {strength.howToLeverage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOMIZED ROADMAP */}
            {results.customizedRoadmap && results.customizedRoadmap.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Your Personalized AI Adaptation Roadmap
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {results.customizedRoadmap.map((phase, index) => (
                      <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-5 border-l-4 border-indigo-500">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {phase.phase}
                          </h4>
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                            {phase.timeline}
                          </span>
                        </div>
                        <ul className="space-y-2 mb-4">
                          {phase.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start text-gray-700 dark:text-gray-300">
                              <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm">Expected Outcome: </span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                            {phase.expectedOutcome}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Risk and Protective Factors Grid */}
            {(results.specificRiskFactors?.length > 0 || results.protectiveFactors?.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {results.specificRiskFactors && results.specificRiskFactors.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-lg mb-4 text-red-700 dark:text-red-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Specific Risk Factors
                    </h3>
                    <ul className="space-y-3">
                      {results.specificRiskFactors.map((risk, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1">•</span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {results.protectiveFactors && results.protectiveFactors.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-lg mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Protective Factors
                    </h3>
                    <ul className="space-y-3">
                      {results.protectiveFactors.map((factor, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Statistics Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Vulnerability Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(results.vulnerabilityIndex.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              value >= 70 ? 'bg-red-500' :
                              value >= 40 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 min-w-[3rem] text-right">
                          {value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Assessment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Confidence Level:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{results.vulnerabilityIndex.confidence}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Time to Impact:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{results.vulnerabilityIndex.timeToImpact} months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Occupations Matched:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{results.occupations.length}</span>
                  </div>
                  {hasEnhancedInsights && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">AI Analysis:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">Enhanced ✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200">Impact Timeline</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-5">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3">Short-term (1-2 years)</h4>
                  <ul className="space-y-2">
                    {results.vulnerabilityIndex.timeline.shortTerm.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">• {item.description}</span>
                        <span className="text-blue-600 dark:text-blue-400 ml-1">({item.likelihood}% likely)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-5">
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-3">Medium-term (3-5 years)</h4>
                  <ul className="space-y-2">
                    {results.vulnerabilityIndex.timeline.mediumTerm.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">• {item.description}</span>
                        <span className="text-yellow-600 dark:text-yellow-400 ml-1">({item.likelihood}% likely)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-3">Long-term (5+ years)</h4>
                  <ul className="space-y-2">
                    {results.vulnerabilityIndex.timeline.longTerm.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">• {item.description}</span>
                        <span className="text-purple-600 dark:text-purple-400 ml-1">({item.likelihood}% likely)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
                <h3 className="text-xl font-bold text-white">Personalized Recommendations</h3>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {results.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Research Citations */}
            {results.aiInsights?.researchCitations && results.aiInsights.researchCitations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Research Citations
                </h3>
                <div className="space-y-3">
                  {results.aiInsights.researchCitations.map((citation, index) => (
                    <div key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-1">{citation.finding}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Source:</span> {citation.source} | 
                        <span className="font-medium ml-1">Relevance:</span> {citation.relevance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="text-center py-8">
              <button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transform transition hover:scale-105"
              >
                Download Full PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // INPUT FORM
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              AI Impact Assessment
            </h1>
            <p className="text-blue-100 text-center max-w-2xl mx-auto">
              Upload your resume or paste a job description to get a comprehensive analysis of AI's impact on your career, 
              backed by Microsoft research and enhanced with AI insights.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Assessment Type
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleUserTypeChange('individual')}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    assessmentData.type === 'individual'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-lg mr-2">👤</span>
                  Individual ($29)
                </button>
                <button
                  onClick={() => handleUserTypeChange('business')}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    assessmentData.type === 'business'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-lg mr-2">🏢</span>
                  Business ($49)
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Upload Resume or Job Description
              </label>
              <FileUpload onFileProcessed={handleFileProcessed} />
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Or paste content directly
              </label>
              <textarea
                value={assessmentData.content || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full h-40 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Paste your resume, job description, or career details here..."
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${
                  assessmentData.content && assessmentData.content.length >= 50 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {assessmentData.content?.length || 0} characters 
                  {assessmentData.content && assessmentData.content.length >= 50 && ' ✓'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (minimum 50 required)
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 dark:text-red-400">{error}</span>
              </div>
            )}

            {/* Analyze Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleAnalyze}
                disabled={!assessmentData.content || assessmentData.content.length < 50 || isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg min-w-[240px]"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing with AI...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyze AI Impact (${assessmentData.type === 'business' ? '49' : '29'})
                  </span>
                )}
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                  <span className="text-2xl">🔬</span>
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">Research-Backed</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Microsoft study + AI insights</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">Enhanced Analysis</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">GPT-4 powered insights</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">Actionable Roadmap</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Personalized adaptation plan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}