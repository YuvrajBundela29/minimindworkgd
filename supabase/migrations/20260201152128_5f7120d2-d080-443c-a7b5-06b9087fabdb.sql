-- First drop all objects that depend on the old subscription_tier type
DROP VIEW IF EXISTS public.user_subscription_view;
DROP FUNCTION IF EXISTS public.get_user_subscription();

-- Create a new enum type with the additional 'plus' value
CREATE TYPE subscription_tier_new AS ENUM ('free', 'plus', 'pro');

-- Update the column to use the new type
ALTER TABLE public.user_subscriptions 
  ALTER COLUMN tier DROP DEFAULT;

ALTER TABLE public.user_subscriptions 
  ALTER COLUMN tier TYPE subscription_tier_new 
  USING (tier::text::subscription_tier_new);

ALTER TABLE public.user_subscriptions 
  ALTER COLUMN tier SET DEFAULT 'free'::subscription_tier_new;

-- Drop the old enum type
DROP TYPE subscription_tier;

-- Rename the new enum to the original name
ALTER TYPE subscription_tier_new RENAME TO subscription_tier;

-- Recreate the view
CREATE VIEW public.user_subscription_view AS
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
FROM public.user_subscriptions;

-- Recreate the get_user_subscription function with updated return type
CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  tier subscription_tier,
  plan_type plan_type,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  status subscription_status,
  credits_daily_used integer,
  credits_monthly_used integer,
  credits_last_daily_reset date,
  credits_last_monthly_reset date,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
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

-- Add usage tracking columns for feature gating (replaces credit system)
ALTER TABLE public.user_subscriptions 
  ADD COLUMN IF NOT EXISTS daily_questions_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_question_reset DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Function to check and use daily question allowance
CREATE OR REPLACE FUNCTION public.use_daily_question()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_tier subscription_tier;
  current_used INTEGER;
  current_reset DATE;
  daily_limit INTEGER := 5;
BEGIN
  SELECT tier, daily_questions_used, last_question_reset 
  INTO current_tier, current_used, current_reset
  FROM public.user_subscriptions
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF current_reset < CURRENT_DATE THEN
    UPDATE public.user_subscriptions
    SET daily_questions_used = 1,
        last_question_reset = CURRENT_DATE
    WHERE user_id = auth.uid();
    RETURN TRUE;
  END IF;
  
  IF current_tier IN ('plus', 'pro') THEN
    UPDATE public.user_subscriptions
    SET daily_questions_used = daily_questions_used + 1
    WHERE user_id = auth.uid();
    RETURN TRUE;
  END IF;
  
  IF current_used >= daily_limit THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.user_subscriptions
  SET daily_questions_used = daily_questions_used + 1
  WHERE user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;