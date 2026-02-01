-- Add purpose_lens and custom_lens_prompt columns to user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS purpose_lens TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS custom_lens_prompt TEXT DEFAULT NULL;