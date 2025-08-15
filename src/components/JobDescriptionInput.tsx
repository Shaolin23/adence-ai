'use client'
import { useState } from 'react'

interface JobDescriptionInputProps {
  onSubmit: (content: string) => void
}

export function JobDescriptionInput({ onSubmit }: JobDescriptionInputProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showExamples, setShowExamples] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.length < 50) return

    setIsLoading(true)
    try {
      onSubmit(content.trim())
    } finally {
      setIsLoading(false)
    }
  }

  const insertExample = (example: string) => {
    setContent(example)
    setShowExamples(false)
  }

  const examples = [
    {
      title: "Software Engineer",
      content: "Senior Software Engineer with 5 years of experience developing web applications using React, Node.js, and Python. Responsible for designing scalable architectures, mentoring junior developers, and implementing CI/CD pipelines. Experience with AWS, Docker, and microservices. Led a team of 4 developers on a customer-facing platform serving 100k+ users. Strong background in machine learning and data analysis."
    },
    {
      title: "Marketing Manager",
      content: "Marketing Manager with 7 years of experience in digital marketing, brand management, and campaign strategy. Expertise in Google Analytics, social media marketing, content creation, and lead generation. Managed marketing budgets of $500k+ and increased brand awareness by 40%. Experience with marketing automation tools, A/B testing, and customer segmentation. Led cross-functional teams and collaborated with sales and product teams."
    },
    {
      title: "Data Analyst",
      content: "Data Analyst with 4 years of experience in business intelligence, statistical analysis, and data visualization. Proficient in SQL, Python, R, and Tableau. Experience with machine learning algorithms, predictive modeling, and data mining. Worked with large datasets (1M+ records) to identify trends and insights. Created automated reports and dashboards for executive decision-making. Background in finance and healthcare analytics."
    }
  ]

  const getCharacterCountColor = () => {
    if (content.length < 50) return 'text-red-500'
    if (content.length < 100) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getProgressWidth = () => {
    return Math.min((content.length / 200) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
              Job Description or Role Details
            </label>
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showExamples ? 'Hide' : 'Show'} Examples
            </button>
          </div>
          
          <textarea
            id="job-description"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your current role, responsibilities, key skills, technologies used, years of experience, industry, and any specific achievements or projects. The more detailed, the more accurate your AI impact assessment will be..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        
        {/* Character count and progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className={getCharacterCountColor()}>
              {content.length} characters
              {content.length < 50 && (
                <span className="ml-2 text-red-600">
                  (Minimum 50 characters required)
                </span>
              )}
            </span>
            <span className="text-gray-500">
              Recommended: 200+ characters for best results
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                content.length < 50 ? 'bg-red-400' :
                content.length < 100 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${getProgressWidth()}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            💡 Include specific technologies, tools, and responsibilities
          </div>
          <button
            type="submit"
            disabled={isLoading || content.length < 50}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </div>
            ) : (
              'Analyze AI Impact'
            )}
          </button>
        </div>
      </form>

      {/* Examples dropdown */}
      {showExamples && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Example Job Descriptions:</h4>
          <div className="grid gap-3">
            {examples.map((example, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">{example.title}</h5>
                  <button
                    onClick={() => insertExample(example.content)}
                    className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Use This
                  </button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {example.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhancement tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-800 font-medium mb-2">🚀 For Maximum Accuracy, Include:</h4>
        <div className="grid md:grid-cols-2 gap-3 text-blue-700 text-sm">
          <div>
            <ul className="space-y-1">
              <li>• Specific job title and level (Junior/Senior/Lead)</li>
              <li>• Years of experience in your field</li>
              <li>• Programming languages or software tools</li>
              <li>• Industry and company size</li>
            </ul>
          </div>
          <div>
            <ul className="space-y-1">
              <li>• Key responsibilities and daily tasks</li>
              <li>• Leadership or management experience</li>
              <li>• Certifications or education background</li>
              <li>• Unique skills or specializations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}