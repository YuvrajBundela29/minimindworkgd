import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ success: false, error: "not_authenticated" }, 401);
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return json({ success: false, error: "not_authenticated" }, 401);
    }

    const payload = await req.json().catch(() => ({}));
    const code = typeof payload?.code === "string" ? payload.code.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{4,16}$/.test(code)) {
      return json({ success: false, error: "invalid_code" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await admin.rpc("apply_referral_for_user", {
      p_user_id: user.id,
      p_code: code,
    });

    if (error) {
      console.error("apply_referral_for_user failed:", error.message);
      return json({ success: false, error: "unexpected_error" }, 500);
    }

    return json(data);
  } catch (err) {
    console.error("apply-referral error:", err instanceof Error ? err.message : err);
    return json({ success: false, error: "unexpected_error" }, 500);
  }
});
