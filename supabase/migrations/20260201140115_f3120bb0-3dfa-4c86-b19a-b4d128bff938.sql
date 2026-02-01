-- Create a secure view for user subscriptions that hides payment identifiers
CREATE OR REPLACE VIEW public.user_subscription_view AS
SELECT 
  id,
  user_id,
  tier,
  plan_type,
  current_period_start,
  current_period_end,
  status,
  credits_daily_used,
  credits_monthly_used,
  credits_last_daily_reset,
  credits_last_monthly_reset,
  created_at,
  updated_at
FROM public.user_subscriptions
WHERE auth.uid() = user_id;

-- Enable RLS on the view (views inherit from base table, but we're being explicit)
-- Grant access to the view
GRANT SELECT ON public.user_subscription_view TO authenticated;

-- Create a security definer function to get subscription safely
CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  tier subscription_tier,
  plan_type plan_type,
  current_period_start timestamptz,
  current_period_end timestamptz,
  status subscription_status,
  credits_daily_used integer,
  credits_monthly_used integer,
  credits_last_daily_reset date,
  credits_last_monthly_reset date,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.tier,
    s.plan_type,
    s.current_period_start,
    s.current_period_end,
    s.status,
    s.credits_daily_used,
    s.credits_monthly_used,
    s.credits_last_daily_reset,
    s.credits_last_monthly_reset,
    s.created_at,
    s.updated_at
  FROM public.user_subscriptions s
  WHERE s.user_id = auth.uid();
END;
$$;

-- Create a function to update credit usage safely
CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_daily_used integer,
  p_monthly_used integer,
  p_daily_reset date DEFAULT NULL,
  p_monthly_reset date DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET 
    credits_daily_used = p_daily_used,
    credits_monthly_used = p_monthly_used,
    credits_last_daily_reset = COALESCE(p_daily_reset, credits_last_daily_reset),
    credits_last_monthly_reset = COALESCE(p_monthly_reset, credits_last_monthly_reset),
    updated_at = now()
  WHERE user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;