import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify webhook signature
    const expectedSignature = await generateSignature(body, RAZORPAY_KEY_SECRET);
    if (signature !== expectedSignature) {
      console.error("Webhook signature verification failed");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`Webhook received: ${eventType}`);

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (eventType) {
      case "payment.captured": {
        // Payment successful - already handled by verify endpoint
        console.log("Payment captured:", event.payload.payment.entity.id);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        
        console.log(`Payment failed for order: ${orderId}`);
        
        // Log the failure but don't downgrade - user can retry
        break;
      }

      case "subscription.charged": {
        // Recurring payment successful
        const subscription = event.payload.subscription.entity;
        const customerId = subscription.customer_id;
        
        // Find user by Razorpay customer ID and extend subscription
        const { data: userSub } = await adminSupabase
          .from("user_subscriptions")
          .select("*")
          .eq("razorpay_customer_id", customerId)
          .single();

        if (userSub) {
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          await adminSupabase
            .from("user_subscriptions")
            .update({
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              grace_period_end: null,
            })
            .eq("user_id", userSub.user_id);

          console.log(`Subscription renewed for user: ${userSub.user_id}`);
        }
        break;
      }

      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        const customerId = subscription.customer_id;

        // Find and mark subscription as cancelled
        const { data: userSub } = await adminSupabase
          .from("user_subscriptions")
          .select("*")
          .eq("razorpay_customer_id", customerId)
          .single();

        if (userSub) {
          // Set grace period of 7 days after current period ends
          const gracePeriodEnd = new Date(userSub.current_period_end);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

          await adminSupabase
            .from("user_subscriptions")
            .update({
              status: 'cancelled',
              grace_period_end: gracePeriodEnd.toISOString(),
            })
            .eq("user_id", userSub.user_id);

          console.log(`Subscription cancelled for user: ${userSub.user_id}`);
        }
        break;
      }

      case "subscription.expired": {
        const subscription = event.payload.subscription.entity;
        const customerId = subscription.customer_id;

        // Downgrade to free after grace period
        const { data: userSub } = await adminSupabase
          .from("user_subscriptions")
          .select("*")
          .eq("razorpay_customer_id", customerId)
          .single();

        if (userSub) {
          const now = new Date();
          const gracePeriodEnd = userSub.grace_period_end ? new Date(userSub.grace_period_end) : null;

          // Only downgrade if grace period has passed
          if (!gracePeriodEnd || now > gracePeriodEnd) {
            await adminSupabase
              .from("user_subscriptions")
              .update({
                tier: 'free',
                plan_type: null,
                status: 'expired',
                grace_period_end: null,
              })
              .eq("user_id", userSub.user_id);

            console.log(`Subscription expired for user: ${userSub.user_id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
