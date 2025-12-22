-- Add DELETE policies for user data tables (user_statistics, user_settings, user_achievements)
-- This allows users to remove their own data for privacy and data portability

CREATE POLICY "Users can delete their own statistics"
ON public.user_statistics
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
ON public.user_settings
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
ON public.user_achievements
FOR DELETE
USING (auth.uid() = user_id);

-- Update handle_new_user function with input validation and length limits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  safe_display_name text;
BEGIN
  -- Validate and sanitize display_name from raw_user_meta_data
  -- Limit to 100 characters and strip any potentially dangerous content
  safe_display_name := LEFT(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''), NULL), 100);
  
  -- Remove any HTML-like tags for XSS prevention
  IF safe_display_name IS NOT NULL THEN
    safe_display_name := REGEXP_REPLACE(safe_display_name, '<[^>]*>', '', 'g');
    -- Also remove script patterns
    safe_display_name := REGEXP_REPLACE(safe_display_name, 'javascript:', '', 'gi');
    safe_display_name := REGEXP_REPLACE(safe_display_name, 'on\w+\s*=', '', 'gi');
  END IF;

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, safe_display_name);
  
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user registration
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;