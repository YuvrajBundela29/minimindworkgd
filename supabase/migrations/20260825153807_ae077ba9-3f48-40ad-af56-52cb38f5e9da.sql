REVOKE ALL ON FUNCTION public.update_user_credits(integer, integer, date, date) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_own_credit(integer) FROM anon;
REVOKE ALL ON FUNCTION public.use_daily_question() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_referral_code(text) FROM anon;
REVOKE ALL ON FUNCTION public.get_or_create_referral_code() FROM anon;
REVOKE ALL ON FUNCTION public.get_user_subscription() FROM anon;