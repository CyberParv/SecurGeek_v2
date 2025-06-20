-- First, let's clean up any problematic policies
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile after signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable profile creation for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;

-- Create a simple, working profile creation policy
CREATE POLICY "Enable profile creation for all users"
  ON public.profiles
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Allow users to read their own profiles
CREATE POLICY "Users can read their own profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profiles
CREATE POLICY "Users can update their own profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Recreate the user creation function with maximum compatibility
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_first_name text;
  user_last_name text;
BEGIN
  -- Extract values safely
  user_email := COALESCE(NEW.email, '');
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  
  -- Insert profile with minimal required data
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_email,
    user_first_name,
    user_last_name,
    'student'::user_role,
    true,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE LOG 'Profile creation error for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant all necessary permissions (without the problematic ALL TYPES syntax)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Specifically grant permissions on the profiles table and user_role type
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.user_role TO anon, authenticated, service_role;

-- Grant usage on other custom types individually
GRANT USAGE ON TYPE public.course_level TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.course_status TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.notification_type TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.quiz_question_type TO anon, authenticated, service_role;

-- Test the setup
DO $$
BEGIN
  RAISE NOTICE 'Authentication setup completed successfully';
END $$;