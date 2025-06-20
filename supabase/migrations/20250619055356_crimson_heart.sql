/*
  # Fix profiles table nullable fields

  1. Changes
    - Make `first_name` and `last_name` columns nullable in profiles table
    - This prevents NOT NULL constraint violations during user signup
    - The trigger function can safely insert users even when metadata is incomplete

  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Make first_name and last_name nullable to prevent signup errors
ALTER TABLE profiles 
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL;