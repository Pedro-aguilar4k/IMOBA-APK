import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { finalizeSubscription } from '@/app/(marketing)/assinar/actions'

export const runtime = 'nodejs'

async function processEvent(event: Stripe.Event) {
  const admin = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    await finalizeSubscription(event.data.object.id)
    return
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object
    await admin
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_end: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('stripe_webhook_events')
    .select('event_id')
    .eq('event_id', event.id)
    .maybeSingle()
  if (existing) return NextResponse.json({ received: true, duplicate: true })

  try {
    await processEvent(event)
    const { error } = await admin.from('stripe_webhook_events').insert({
      event_id: event.id,
      event_type: event.type,
    })
    if (error?.code !== '23505' && error) throw error
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Falha ao processar evento.' }, { status: 500 })
  }
}
