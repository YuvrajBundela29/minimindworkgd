import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget usage logging for authenticated users.
 * Never throws — failures are silently logged to console.
 */
export function logUsage(params: {
  queryText: string;
  mode: string;
  language: string;
  responseLength: number;
}): void {
  // Don't await — fire and forget
  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Skip for guests

      await supabase.from("usage_logs").insert({
        user_id: user.id,
        query_text: params.queryText,
        mode: params.mode,
        language: params.language,
        response_length: params.responseLength,
      });
    } catch (err) {
      console.error("Usage logging failed (non-blocking):", err);
    }
  })();
}
