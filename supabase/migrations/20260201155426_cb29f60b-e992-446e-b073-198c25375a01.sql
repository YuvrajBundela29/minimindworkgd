-- Add DELETE policy for user_streaks table to allow users to delete their own streak data
-- This aligns with other user data tables that have DELETE policies for data portability

CREATE POLICY "Users can delete their own streaks"
ON public.user_streaks
FOR DELETE
USING (auth.uid() = user_id);