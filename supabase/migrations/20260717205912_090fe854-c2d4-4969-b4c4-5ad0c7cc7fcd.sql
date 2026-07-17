
-- 1) Certificates: drop broad anon SELECT policy, replace with code-scoped RPC
DROP POLICY IF EXISTS "Anyone can verify certificates by code" ON public.certificates;

CREATE OR REPLACE FUNCTION public.verify_certificate(p_code text)
RETURNS TABLE (
  certificate_code text,
  learning_path_name text,
  mastery_score integer,
  issued_at timestamptz,
  holder_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.certificate_code, c.learning_path_name, c.mastery_score, c.issued_at,
         COALESCE(p.display_name, 'Learner')
  FROM public.certificates c
  LEFT JOIN public.profiles p ON p.user_id = c.user_id
  WHERE c.certificate_code = p_code
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 2) Arena leaderboard: hide user_id column from clients
REVOKE SELECT (user_id) ON public.arena_leaderboard FROM anon, authenticated;

-- 3) Storage: drop broad SELECT that allows listing avatars
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- 4) Revoke EXECUTE on SECURITY DEFINER functions from anon (and authenticated where unsafe)
REVOKE EXECUTE ON FUNCTION public.issue_badge_certificate() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_subscription() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_streaks_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Edge-function-only credit functions: revoke from clients, keep service_role
REVOKE EXECUTE ON FUNCTION public.deduct_user_credit(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_user_credit(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_credits(integer, integer, date, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.use_daily_question() FROM PUBLIC, anon;

-- Explicitly revoke anon on functions that need auth.uid()
REVOKE EXECUTE ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_referral_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_subscription() FROM PUBLIC, anon;

-- 5) Safe wrapper: refund own credit using auth.uid() (replaces client use of refund_user_credit)
CREATE OR REPLACE FUNCTION public.refund_own_credit(p_cost integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF p_cost IS NULL OR p_cost <= 0 OR p_cost > 1000 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_cost');
  END IF;
  RETURN public.refund_user_credit(v_user, p_cost);
END;
$$;

REVOKE ALL ON FUNCTION public.refund_own_credit(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_own_credit(integer) TO authenticated;
