'use client'
import { useState } from 'react'

interface PaymentGatewayProps {
  amount: number
  userType: 'individual' | 'business'
  onSuccess: () => void
}

export function PaymentGateway({ amount, userType, onSuccess }: PaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'simulation' | 'stripe'>('simulation')

  const features = userType === 'individual' 
    ? [
        'Comprehensive AI vulnerability analysis',
        'Research-backed insights from Microsoft + Goldman Sachs',
        'Occupation matching against 900+ O*NET profiles',
        'Professional PDF report with actionable recommendations',
        'Timeline projections for next 5 years',
        'Technology skills assessment',
        'Career transition guidance'
      ]
    : [
        'Everything in Individual plan, plus:',
        'Workforce vulnerability assessment',
        'Team transition planning insights',
        'Industry-specific AI adoption timelines',
        'Budget planning for AI integration',
        'Training program recommendations',
        'Executive summary for leadership'
      ]

  const handlePayment = async () => {
    if (!email.trim()) {
      alert('Please enter your email address')
      return
    }

    setIsProcessing(true)
    
    try {
      if (paymentMethod === 'simulation') {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))
        onSuccess()
      } else {
        // Real Stripe integration
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: amount * 100, // Convert to cents
            userType,
            email 
          })
        })

        if (response.ok) {
          const { clientSecret } = await response.json()
          // Handle Stripe payment flow here
          // For now, simulate success
          onSuccess()
        } else {
          throw new Error('Payment processing failed')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Order Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h3>
        
        <div className="flex justify-between items-center text-lg mb-4">
          <span className="font-medium">
            AI Impact Assessment ({userType === 'individual' ? 'Individual' : 'Business'})
          </span>
          <span className="font-bold text-2xl text-blue-600">${amount}</span>
        </div>
        
        <div className="border-t pt-4 space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start text-sm text-gray-700">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Value proposition */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center text-sm">
            <span className="text-yellow-600 mr-2">💡</span>
            <span className="text-yellow-800">
              <strong>Compare:</strong> Professional career consultations cost $200-500/hour. 
              Get research-backed insights for just ${amount}.
            </span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Payment Details</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Your report will be delivered to this email address
          </p>
        </div>

        {/* Payment method selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="simulation"
                checked={paymentMethod === 'simulation'}
                onChange={(e) => setPaymentMethod(e.target.value as 'simulation')}
                className="mr-2"
                disabled={isProcessing}
              />
              <span className="text-sm">Demo Payment (For Testing)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                className="mr-2"
                disabled={isProcessing}
              />
              <span className="text-sm">Credit/Debit Card (Stripe)</span>
            </label>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing || !email.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay $${amount} & Generate Report`
          )}
        </button>

        {/* Security badges */}
        <div className="flex justify-center items-center space-x-4 pt-4 border-t">
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">🔒</span>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">💳</span>
            <span>Stripe Secure</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">⚡</span>
            <span>Instant Delivery</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Secure payment processing. Your report will be generated and delivered immediately after payment confirmation.
        </p>
      </div>

      {/* Money-back guarantee */}
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center text-sm text-green-800">
          <span className="text-green-600 mr-2">✓</span>
          <div>
            <strong>Satisfaction Guarantee:</strong> If you're not satisfied with your AI impact assessment, 
            contact us within 7 days for a full refund. No questions asked.
          </div>
        </div>
      </div>
    </div>
  )
}