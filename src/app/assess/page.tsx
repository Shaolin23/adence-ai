// /src/app/assess/page.tsx
'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload' // Default import
import { AssessmentInput, AssessmentResult } from '@/types/research'

export default function AssessPage() {
  const [assessmentData, setAssessmentData] = useState<Partial<AssessmentInput>>({
    content: '',
    type: 'individual'
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState<string>('')

  const handleFileProcessed = (content: string) => {
    setAssessmentData(prev => ({ 
      ...prev, 
      content,
      // Remove uploadType as it doesn't exist in AssessmentInput
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
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()
      setResults(result)
    } catch (error) {
      console.error('Assessment error:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <button
                onClick={() => {
                  setResults(null)
                  setAssessmentData({ content: '', type: 'individual' })
                }}
                className="text-blue-600 hover:text-blue-800 mb-4"
              >
                ← New Analysis
              </button>
              <h1 className="text-3xl font-bold text-gray-900">AI Impact Assessment Results</h1>
            </div>

            <div className="space-y-6">
              {/* Risk Level Display */}
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-lg text-lg font-semibold ${
                  results.vulnerabilityIndex.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                  results.vulnerabilityIndex.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                  results.vulnerabilityIndex.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Risk Level: {results.vulnerabilityIndex.riskLevel.toUpperCase()}
                  <div className="text-sm mt-1">
                    Overall Score: {results.vulnerabilityIndex.overall}%
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Vulnerability Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Automation Risk:</span>
                      <span className="font-medium">{results.vulnerabilityIndex.breakdown.automation}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skill Transfer Risk:</span>
                      <span className="font-medium">{results.vulnerabilityIndex.breakdown.skillTransfer}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Geographic Risk:</span>
                      <span className="font-medium">{results.vulnerabilityIndex.breakdown.geographic}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Demographic Risk:</span>
                      <span className="font-medium">{results.vulnerabilityIndex.breakdown.demographic}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Assessment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Confidence Level:</span>
                      <span className="font-medium">{results.vulnerabilityIndex.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time to Impact:</span>
                      <span className="font-medium">{results.vulnerabilityIndex.timeToImpact} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Occupations Matched:</span>
                      <span className="font-medium">{results.occupations.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Short-term (1-2 years)</h3>
                  <ul className="space-y-1 text-sm">
                    {results.vulnerabilityIndex.timeline.shortTerm.map((item, index) => (
                      <li key={index}>
                        • {item.description} ({item.likelihood}% likely)
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Medium-term (3-5 years)</h3>
                  <ul className="space-y-1 text-sm">
                    {results.vulnerabilityIndex.timeline.mediumTerm.map((item, index) => (
                      <li key={index}>
                        • {item.description} ({item.likelihood}% likely)
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Long-term (5+ years)</h3>
                  <ul className="space-y-1 text-sm">
                    {results.vulnerabilityIndex.timeline.longTerm.map((item, index) => (
                      <li key={index}>
                        • {item.description} ({item.likelihood}% likely)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Personalized Recommendations</h3>
                <ul className="space-y-2">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Matched Occupations */}
              {results.occupations.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Best Occupation Matches</h3>
                  <div className="space-y-3">
                    {results.occupations.map((occ, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="font-medium">{occ.title}</div>
                        <div className="text-sm text-gray-600 mb-2">{occ.description}</div>
                        <div className="flex space-x-4 text-xs text-gray-500">
                          <span>Match: {occ.matchScore}%</span>
                          <span>AI Impact: {occ.aiImpactScore.overall}%</span>
                          <span>Industry: {occ.industry}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Button */}
              <div className="text-center">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Download Full PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              AI Impact Assessment
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload your resume or paste a job description to get a comprehensive analysis of AI's impact on your career, 
              backed by Microsoft research and economic studies.
            </p>
          </div>

          <div className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assessment Type
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleUserTypeChange('individual')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    assessmentData.type === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👤 Individual ($29)
                </button>
                <button
                  onClick={() => handleUserTypeChange('business')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    assessmentData.type === 'business'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏢 Business ($49)
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Resume or Job Description
              </label>
              <FileUpload onFileProcessed={handleFileProcessed} />
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Or paste content directly
              </label>
              <textarea
                value={assessmentData.content || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full h-40 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your resume, job description, or career details here..."
              />
              <div className="text-sm text-gray-500 mt-2">
                {assessmentData.content?.length || 0} characters 
                {assessmentData.content && assessmentData.content.length >= 50 
                  ? ' ✓' 
                  : ' (minimum 50 required)'}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                disabled={!assessmentData.content || assessmentData.content.length < 50 || isAnalyzing}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors min-w-[200px]"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  `Analyze AI Impact (${assessmentData.type === 'business' ? '$49' : '$29'})`
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl mb-2">🔬</div>
                <div className="font-medium">Research-Backed</div>
                <div className="text-sm text-gray-600">Microsoft study of 200k AI conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium">Instant Analysis</div>
                <div className="text-sm text-gray-600">Professional report in under 30 seconds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">Actionable Insights</div>
                <div className="text-sm text-gray-600">Specific recommendations for your career</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}