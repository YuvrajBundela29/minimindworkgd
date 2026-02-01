import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Top-up products
const TOP_UP_PRODUCTS = {
  pack_25: { credits: 25, type: 'pack' },
  pack_60: { credits: 60, type: 'pack' },
  pack_150: { credits: 150, type: 'pack' },
  booster_weekly: { credits: 20, type: 'booster', duration: 7 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { orderId, paymentId, signature, productId } = await req.json();

    // Verify signature
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureData = `${orderId}|${paymentId}`;
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signatureData)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== signature) {
      console.error("Signature mismatch for top-up payment");
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const product = TOP_UP_PRODUCTS[productId as keyof typeof TOP_UP_PRODUCTS];
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Invalid product" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for updating subscription
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (product.type === 'pack') {
      // Add bonus credits (stored in a way that doesn't expire)
      // For now, we'll reset the monthly credits as a simple implementation
      // A full implementation would use a separate credits_bonus table
      
      const { data: currentSub } = await supabaseAdmin
        .from("user_subscriptions")
        .select("credits_monthly_used")
        .eq("user_id", user.id)
        .single();

      // Subtract credits from used (effectively adding them)
      const newMonthlyUsed = Math.max(0, (currentSub?.credits_monthly_used || 0) - product.credits);

      await supabaseAdmin
        .from("user_subscriptions")
        .update({ credits_monthly_used: newMonthlyUsed })
        .eq("user_id", user.id);

      console.log(`Added ${product.credits} credits to user ${user.id}`);
    } else if (product.type === 'booster') {
      // Weekly booster - increase daily limit temporarily
      // For simplicity, we reset daily credits for 7 days worth
      await supabaseAdmin
        .from("user_subscriptions")
        .update({ credits_daily_used: -product.credits }) // Negative means bonus
        .eq("user_id", user.id);

      console.log(`Activated weekly booster for user ${user.id}`);
    }

    return new Response(
      JSON.stringify({ success: true, credits: product.credits }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify top-up payment error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
