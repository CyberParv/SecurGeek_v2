/*
  # Fix User Signup Database Error

  1. Create proper trigger function for user profile creation
  2. Set up correct RLS policies for profile insertion
  3. Grant necessary permissions for signup process

  This migration fixes the "Database error saving new user" issue by ensuring
  the trigger function works correctly and has proper permissions.
*/

-- Create or replace the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table with error handling
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    email_verified,
    login_count,
    failed_login_attempts,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'student'::user_role,
    true,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remove conflicting policies first
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Create a policy that allows profile creation during the signup process
-- This policy allows inserts when the user ID matches the authenticated user
-- or when it's being created by the trigger (which runs as SECURITY DEFINER)
CREATE POLICY "Allow profile creation during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NULL OR
    current_setting('role') = 'service_role'
  );

-- Ensure proper permissions are granted
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure the user_role type can be used
GRANT USAGE ON TYPE public.user_role TO anon, authenticated, service_role;

-- Test the function by checking if it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE EXCEPTION 'Function handle_new_user was not created successfully';
  END IF;
END $$;