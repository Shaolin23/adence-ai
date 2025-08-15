// /src/lib/pdf-generator.ts
import jsPDF from 'jspdf'
import { AssessmentResult } from '@/types/research'

export async function generatePDF(results: AssessmentResult): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('AI Impact Assessment Report', 20, 30)
  
  doc.setFontSize(12)
  doc.text(`Generated: ${new Date(results.generatedAt).toLocaleDateString()}`, 20, 45)
  
  // Overall Score
  doc.setFontSize(16)
  doc.text('Overall Vulnerability Score', 20, 65)
  
  doc.setFontSize(14)
  doc.text(`Risk Level: ${results.vulnerabilityIndex.riskLevel.toUpperCase()}`, 20, 80)
  doc.text(`Overall Score: ${results.vulnerabilityIndex.overall}%`, 20, 95)
  doc.text(`Confidence: ${results.vulnerabilityIndex.confidence}%`, 20, 110)
  
  // Timeline section
  doc.setFontSize(16)
  doc.text('Impact Timeline', 20, 135)
  
  let yPosition = 150
  
  // Short-term
  doc.setFontSize(14)
  doc.text('Short-term (1-2 years):', 20, yPosition)
  yPosition += 15
  
  doc.setFontSize(10)
  results.vulnerabilityIndex.timeline.shortTerm.forEach(item => {
    doc.text(`• ${item.description} (${item.likelihood}% likelihood)`, 25, yPosition)
    yPosition += 12
  })
  
  yPosition += 10
  
  // Medium-term  
  doc.setFontSize(14)
  doc.text('Medium-term (3-5 years):', 20, yPosition)
  yPosition += 15
  
  doc.setFontSize(10)
  results.vulnerabilityIndex.timeline.mediumTerm.forEach(item => {
    doc.text(`• ${item.description} (${item.likelihood}% likelihood)`, 25, yPosition)
    yPosition += 12
  })
  
  // New page for recommendations
  doc.addPage()
  
  doc.setFontSize(16)
  doc.text('Recommendations', 20, 30)
  
  yPosition = 45
  doc.setFontSize(10)
  results.recommendations.forEach(rec => {
    const lines = doc.splitTextToSize(rec, 170)
    doc.text(`• ${lines}`, 20, yPosition)
    yPosition += lines.length * 5 + 8
  })
  
  // Citations
  if (yPosition < 250) {
    yPosition += 20
    doc.setFontSize(14)
    doc.text('Research Sources', 20, yPosition)
    yPosition += 15
    
    doc.setFontSize(8)
    results.citations.forEach(citation => {
      const lines = doc.splitTextToSize(citation, 170)
      doc.text(lines, 20, yPosition)
      yPosition += lines.length * 4 + 6
    })
  }
  
  return Buffer.from(doc.output('arraybuffer'))
}

export function generateHTMLReport(results: AssessmentResult): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Impact Assessment Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .score { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .timeline { margin: 20px 0; }
        .recommendations { background: #f0fdf4; padding: 20px; border-radius: 8px; }
        .risk-critical { color: #dc2626; }
        .risk-high { color: #ea580c; }
        .risk-medium { color: #d97706; }
        .risk-low { color: #16a34a; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AI Impact Assessment Report</h1>
        <p>Generated: ${new Date(results.generatedAt).toLocaleDateString()}</p>
      </div>
      
      <div class="score">
        <h2>Overall Assessment</h2>
        <p class="risk-${results.vulnerabilityIndex.riskLevel}">
          <strong>Risk Level: ${results.vulnerabilityIndex.riskLevel.toUpperCase()}</strong>
        </p>
        <p>Overall Vulnerability Score: ${results.vulnerabilityIndex.overall}%</p>
        <p>Confidence Level: ${results.vulnerabilityIndex.confidence}%</p>
      </div>
      
      <div class="timeline">
        <h2>Impact Timeline</h2>
        
        <h3>Short-term (1-2 years)</h3>
        <ul>
          ${results.vulnerabilityIndex.timeline.shortTerm.map(item => 
            `<li>${item.description} (${item.likelihood}% likelihood)</li>`
          ).join('')}
        </ul>
        
        <h3>Medium-term (3-5 years)</h3>
        <ul>
          ${results.vulnerabilityIndex.timeline.mediumTerm.map(item => 
            `<li>${item.description} (${item.likelihood}% likelihood)</li>`
          ).join('')}
        </ul>
        
        <h3>Long-term (5+ years)</h3>
        <ul>
          ${results.vulnerabilityIndex.timeline.longTerm.map(item => 
            `<li>${item.description} (${item.likelihood}% likelihood)</li>`
          ).join('')}
        </ul>
      </div>
      
      <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
          ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      
      <div class="citations">
        <h2>Research Sources</h2>
        <ul>
          ${results.citations.map(citation => `<li style="font-size: 12px;">${citation}</li>`).join('')}
        </ul>
      </div>
    </body>
    </html>
  `
}