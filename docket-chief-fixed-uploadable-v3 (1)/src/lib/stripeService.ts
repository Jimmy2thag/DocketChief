import { supabase } from '@/lib/supabase'

const PAYMENTS_ENABLED = (import.meta.env.VITE_PAYMENTS_ENABLED ?? 'false') === 'true'

type PaymentIntentRequest = {
  amount: number
  currency?: string
  customerEmail?: string
}

export async function createPaymentIntent(req: PaymentIntentRequest) {
  if (!PAYMENTS_ENABLED) {
    throw new Error('Payments are disabled in this environment')
  }
  const { data, error } = await supabase.functions.invoke('payments', {
    body: { op: 'create_payment_intent', ...req },
  })
  if (error) throw new Error(error.message || 'payments function failed')
  return data
}
