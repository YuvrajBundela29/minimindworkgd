
-- 1. Recreate user_subscription_view with security_invoker
DROP VIEW IF EXISTS public.user_subscription_view;
CREATE VIEW public.user_subscription_view 
WITH (security_invoker = on) AS
SELECT id, user_id, tier, plan_type,
  current_period_start, current_period_end, status,
  credits_daily_used, credits_monthly_used,
  credits_last_daily_reset, credits_last_monthly_reset,
  created_at, updated_at
FROM public.user_subscriptions;

-- 2. Restrict user_streaks UPDATE to only safe columns via trigger
CREATE OR REPLACE FUNCTION public.protect_streaks_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Preserve server-managed columns; only allow last_activity_date and streak_updated_at from client
  NEW.xp := OLD.xp;
  NEW.level := OLD.level;
  NEW.current_streak := OLD.current_streak;
  NEW.longest_streak := OLD.longest_streak;
  NEW.streak_shields := OLD.streak_shields;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_streaks_columns_trigger ON public.user_streaks;
CREATE TRIGGER protect_streaks_columns_trigger
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  WHEN (current_setting('role') != 'service_role')
  EXECUTE FUNCTION public.protect_streaks_columns();
