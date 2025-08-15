// /src/app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil', // Use the stable API version that matches your Stripe types
})

export async function POST(request: NextRequest) {
  try {
    const { amount, userType } = await request.json()

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!userType || !['individual', 'business'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userType,
        product: 'ai-impact-assessment',
        version: '1.0.0'
      },
      description: `AI Impact Assessment - ${userType === 'individual' ? 'Individual' : 'Business'} Report`
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('Payment intent creation failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Payment processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Payment service operational',
    timestamp: new Date().toISOString(),
    supportedMethods: ['card', 'google_pay', 'apple_pay'],
    currencies: ['usd'],
    pricing: {
      individual: 29.00,
      business: 49.00
    }
  })
}