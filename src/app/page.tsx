// /src/app/page.tsx - Key fixes

'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import { AssessmentInput, AssessmentResult } from '@/types/research'

export default function Home() {
  const [step, setStep] = useState<'input' | 'payment' | 'results'>('input')
  const [assessmentData, setAssessmentData] = useState<AssessmentInput>({
    content: '',
    type: 'individual'  // Fixed: Added required type property
  })
  const [results, setResults] = useState<AssessmentResult | null>(null)

  const handleFileProcessed = (content: string) => {
    setAssessmentData(prev => ({ ...prev, content }))
  }

  const handleAnalyze = async () => {
    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      })
      
      if (!response.ok) throw new Error('Assessment failed')
      
      const result = await response.json()
      setResults(result)
      setStep('results')
    } catch (error) {
      console.error('Assessment error:', error)
    }
  }

  // Fixed: Proper risk level comparison with lowercase
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            AI Impact Assessment
          </h1>

          {step === 'input' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAssessmentData(prev => ({ ...prev, type: 'individual' }))}
                    className={`px-4 py-2 rounded-md ${
                      assessmentData.type === 'individual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setAssessmentData(prev => ({ ...prev, type: 'business' }))}
                    className={`px-4 py-2 rounded-md ${
                      assessmentData.type === 'business'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Business
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Resume or Job Description</h2>
                <FileUpload onFileProcessed={handleFileProcessed} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste content directly
                </label>
                <textarea
                  value={assessmentData.content}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full h-32 border border-gray-300 rounded-md p-3"
                  placeholder="Paste your resume or job description here..."
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!assessmentData.content}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Analyze AI Impact ($29)
              </button>
            </div>
          )}

          {step === 'results' && results && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">AI Impact Assessment Results</h2>
                <div className={`inline-block px-4 py-2 rounded-lg ${getRiskColor(results.vulnerabilityIndex.riskLevel)}`}>
                  <span className="font-semibold">
                    Risk Level: {results.vulnerabilityIndex.riskLevel.toUpperCase()}
                  </span>
                  <span className="ml-2">
                    ({results.vulnerabilityIndex.overall}% vulnerability)
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Short-term Timeline (1-2 years)</h3>
                  <ul className="space-y-1">
                    {results.vulnerabilityIndex.timeline.shortTerm.map((item, index) => (
                      <li key={index} className="text-sm">
                        • {item.description} ({item.likelihood}% likelihood)
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Medium-term Timeline (3-5 years)</h3>
                  <ul className="space-y-1">
                    {results.vulnerabilityIndex.timeline.mediumTerm.map((item, index) => (
                      <li key={index} className="text-sm">
                        • {item.description} ({item.likelihood}% likelihood)
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Long-term Timeline (5+ years)</h3>
                  <ul className="space-y-1">
                    {results.vulnerabilityIndex.timeline.longTerm.map((item, index) => (
                      <li key={index} className="text-sm">
                        • {item.description} ({item.likelihood}% likelihood)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                Download PDF Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}