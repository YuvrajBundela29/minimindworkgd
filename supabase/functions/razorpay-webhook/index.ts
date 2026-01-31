import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

interface RazorpayPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface WebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: {
          user_id?: string;
          plan_type?: string;
        };
      };
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeySecret) {
      console.error('Razorpay secret not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // If signature header exists, it's a webhook from Razorpay
    if (signature) {
      // Verify webhook signature
      const expectedSignature = createHmac('sha256', razorpayKeySecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const event: WebhookEvent = JSON.parse(body);
      console.log('Received Razorpay webhook:', event.event);

      if (event.event === 'payment.captured') {
        const payment = event.payload.payment?.entity;
        if (!payment) {
          return new Response(
            JSON.stringify({ error: 'No payment data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userId = payment.notes?.user_id;
        const planType = payment.notes?.plan_type as 'monthly' | 'yearly' | undefined;

        if (!userId) {
          console.error('No user_id in payment notes');
          return new Response(
            JSON.stringify({ error: 'No user ID in payment' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Calculate subscription period
        const now = new Date();
        const periodEnd = new Date(now);
        if (planType === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Update subscription in database
        const adminClient = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { error: updateError } = await adminClient
          .from('user_subscriptions')
          .update({
            tier: 'pro',
            status: 'active',
            plan_type: planType || 'monthly',
            razorpay_subscription_id: payment.id,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            credits_daily_used: 0,
            credits_monthly_used: 0,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update subscription' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Subscription activated for user:', userId, 'plan:', planType);
      }

      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Frontend verification (after successful payment on client)
    const payload: RazorpayPaymentPayload = JSON.parse(body);
    
    // Verify payment signature
    const generated_signature = createHmac('sha256', razorpayKeySecret)
      .update(payload.razorpay_order_id + '|' + payload.razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== payload.razorpay_signature) {
      console.error('Payment signature verification failed');
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from order
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: subscription, error: fetchError } = await adminClient
      .from('user_subscriptions')
      .select('*')
      .eq('razorpay_order_id', payload.razorpay_order_id)
      .single();

    if (fetchError || !subscription) {
      console.error('Order not found:', payload.razorpay_order_id);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (subscription.plan_type === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update subscription
    const { error: updateError } = await adminClient
      .from('user_subscriptions')
      .update({
        tier: 'pro',
        status: 'active',
        razorpay_subscription_id: payload.razorpay_payment_id,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        credits_daily_used: 0,
        credits_monthly_used: 0,
      })
      .eq('razorpay_order_id', payload.razorpay_order_id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subscription activated for order:', payload.razorpay_order_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Subscription activated successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
