-- 1. Convert self-scoped read/write helpers to SECURITY INVOKER so they rely on RLS
CREATE OR REPLACE FUNCTION public.get_user_subscription()
 RETURNS TABLE(id uuid, user_id uuid, tier subscription_tier, plan_type plan_type, current_period_start timestamp with time zone, current_period_end timestamp with time zone, status subscription_status, credits_daily_used integer, credits_monthly_used integer, credits_last_daily_reset date, credits_last_monthly_reset date, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT s.id, s.user_id, s.tier, s.plan_type, s.current_period_start, s.current_period_end,
         s.status, s.credits_daily_used, s.credits_monthly_used,
         s.credits_last_daily_reset, s.credits_last_monthly_reset, s.created_at, s.updated_at
  FROM public.user_subscriptions s
  WHERE s.user_id = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_code text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = v_user_id;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  v_code := upper(substring(md5(v_user_id::text || now()::text) from 1 for 8));
  BEGIN
    INSERT INTO public.referral_codes (user_id, code) VALUES (v_user_id, v_code);
  EXCEPTION WHEN unique_violation THEN
    v_code := upper(substring(md5(v_user_id::text || random()::text) from 1 for 8));
    INSERT INTO public.referral_codes (user_id, code) VALUES (v_user_id, v_code);
  END;

  RETURN v_code;
END;
$function$;

-- 2. Remove anonymous execute access from every SECURITY DEFINER function in public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', r.sig);
  END LOOP;
END $$;

-- 3. Certificate verification is not used from the client; keep it server-side only
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO service_role;

-- 4. Only the two definer functions that must cross rows stay callable by signed-in users
REVOKE ALL ON FUNCTION public.refund_user_credit(uuid, integer) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.deduct_user_credit(uuid, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_own_credit(integer) TO authenticated;

-- Re-grant invoker helpers (they no longer bypass RLS)
GRANT EXECUTE ON FUNCTION public.get_user_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;