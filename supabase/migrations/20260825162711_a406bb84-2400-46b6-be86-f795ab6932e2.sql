-- refund_own_credit no longer needs elevated rights: RLS already scopes the user's own row
CREATE OR REPLACE FUNCTION public.refund_own_credit(p_cost integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_daily_used integer;
  v_monthly_used integer;
  v_daily_limit integer;
  v_monthly_limit integer;
  v_tier subscription_tier;
  v_to_monthly integer;
  v_to_daily integer;
  v_remaining integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF p_cost IS NULL OR p_cost <= 0 OR p_cost > 1000 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_cost');
  END IF;

  SELECT tier, credits_daily_used, credits_monthly_used
  INTO v_tier, v_daily_used, v_monthly_used
  FROM public.user_subscriptions
  WHERE user_id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'no_subscription');
  END IF;

  CASE v_tier
    WHEN 'free' THEN v_daily_limit := 15; v_monthly_limit := 0;
    WHEN 'plus' THEN v_daily_limit := 50; v_monthly_limit := 500;
    WHEN 'pro' THEN v_daily_limit := 100; v_monthly_limit := 1000;
    ELSE v_daily_limit := 15; v_monthly_limit := 0;
  END CASE;

  v_remaining := p_cost;
  v_to_monthly := LEAST(v_remaining, v_monthly_used);
  v_remaining := v_remaining - v_to_monthly;
  v_to_daily := LEAST(v_remaining, v_daily_used);

  UPDATE public.user_subscriptions
  SET credits_daily_used = credits_daily_used - v_to_daily,
      credits_monthly_used = credits_monthly_used - v_to_monthly,
      updated_at = now()
  WHERE user_id = v_user;

  RETURN json_build_object(
    'success', true,
    'credits_remaining', (v_daily_limit - (v_daily_used - v_to_daily)) + (v_monthly_limit - (v_monthly_used - v_to_monthly)),
    'daily_remaining', v_daily_limit - (v_daily_used - v_to_daily),
    'monthly_remaining', v_monthly_limit - (v_monthly_used - v_to_monthly),
    'refunded', p_cost
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.refund_own_credit(integer) TO authenticated;

-- Referral application must touch other users' rows, so it stays elevated but is
-- now reachable only through a trusted server function that verifies the caller.
CREATE OR REPLACE FUNCTION public.apply_referral_for_user(p_user_id uuid, p_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer_id uuid;
  v_referral_count integer;
  v_reward_credits integer := 50;
  v_milestone_bonus integer := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF p_code IS NULL OR p_code !~ '^[A-Z0-9]{4,16}$' THEN
    RETURN json_build_object('success', false, 'error', 'invalid_code');
  END IF;

  SELECT user_id INTO v_referrer_id FROM public.referral_codes WHERE code = p_code;
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invalid_code');
  END IF;
  IF v_referrer_id = p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'self_referral');
  END IF;
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = p_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'already_referred');
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, referrer_rewarded, referred_rewarded)
  VALUES (v_referrer_id, p_user_id, true, true);

  UPDATE public.user_subscriptions
  SET credits_daily_used = GREATEST(0, credits_daily_used - v_reward_credits)
  WHERE user_id IN (p_user_id, v_referrer_id);

  SELECT count(*) INTO v_referral_count FROM public.referrals WHERE referrer_id = v_referrer_id;

  IF v_referral_count = 5 THEN
    v_milestone_bonus := 200;
    UPDATE public.user_subscriptions
    SET credits_daily_used = GREATEST(0, credits_daily_used - v_milestone_bonus)
    WHERE user_id = v_referrer_id;
  END IF;

  IF v_referral_count = 20 THEN
    UPDATE public.user_subscriptions
    SET tier = 'pro', status = 'active',
        current_period_start = now(), current_period_end = now() + interval '30 days'
    WHERE user_id = v_referrer_id;
    v_milestone_bonus := -1;
  END IF;

  RETURN json_build_object('success', true, 'reward_credits', v_reward_credits,
    'milestone_bonus', v_milestone_bonus, 'referral_count', v_referral_count);
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_referral_for_user(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_referral_for_user(uuid, text) TO service_role;

DROP FUNCTION IF EXISTS public.apply_referral_code(text);