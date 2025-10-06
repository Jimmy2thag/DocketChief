import { supabase } from './supabase';

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export async function handleStripeWebhook(event: StripeWebhookEvent) {
  console.log('Processing Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Webhook handler error:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  const { id, customer, status, items, current_period_end, cancel_at_period_end, canceled_at } = subscription;
  
  const planId = items.data[0]?.price?.id;
  const planName = items.data[0]?.price?.nickname || items.data[0]?.price?.product;

  // Update or insert subscription
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      status,
      plan_id: planId,
      plan_name: planName,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      cancel_at_period_end,
      canceled_at: canceled_at ? new Date(canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log('Subscription updated successfully:', id);
}

async function handleSubscriptionDeleted(subscription: any) {
  const { id } = subscription;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', id);

  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }

  console.log('Subscription deleted successfully:', id);
}

async function handlePaymentSucceeded(invoice: any) {
  const { id, customer, amount_paid, currency, subscription } = invoice;

  const { error } = await supabase
    .from('payment_history')
    .insert({
      stripe_invoice_id: id,
      stripe_customer_id: customer,
      amount: amount_paid,
      currency,
      status: 'succeeded',
      description: `Payment for subscription ${subscription}`,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording payment:', error);
    throw error;
  }

  console.log('Payment recorded successfully:', id);
}

async function handlePaymentFailed(invoice: any) {
  const { id, customer, amount_due, currency, subscription } = invoice;

  const { error } = await supabase
    .from('payment_history')
    .insert({
      stripe_invoice_id: id,
      stripe_customer_id: customer,
      amount: amount_due,
      currency,
      status: 'failed',
      description: `Failed payment for subscription ${subscription}`,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording failed payment:', error);
    throw error;
  }

  console.log('Failed payment recorded:', id);
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { id, customer, amount, currency } = paymentIntent;

  const { error } = await supabase
    .from('payment_history')
    .insert({
      stripe_payment_intent_id: id,
      stripe_customer_id: customer,
      amount,
      currency,
      status: 'succeeded',
      description: 'One-time payment',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording payment intent:', error);
    throw error;
  }

  console.log('Payment intent recorded:', id);
}
