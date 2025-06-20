/*
  # Fix Admin Policy Infinite Recursion

  1. Problem
    - The "Admins can view all profiles" policy creates infinite recursion
    - Policy queries profiles table while being applied to profiles table
    - This causes database errors and prevents proper data access

  2. Solution
    - Remove the problematic recursive policy
    - Use service role for admin operations
    - Implement admin checks at application level
    - Add safe policies that don't cause recursion

  3. Security
    - Maintain security while avoiding circular references
    - Use auth.jwt() claims for admin verification where possible
    - Fallback to application-level admin checks
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create a safe policy for admin access using service role
-- This avoids the recursion issue by not querying the profiles table within the policy
CREATE POLICY "Service role can access all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to view other users' basic profile info (for public profiles)
-- This is safe and doesn't cause recursion
CREATE POLICY "Users can view basic profile info"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always see their own profile
    auth.uid() = id OR
    -- Users can see basic info of active users (for course instructors, etc.)
    (is_active = true AND role IN ('instructor', 'student'))
  );

-- For admin functionality, we'll handle this at the application level
-- The frontend will use the service role or implement admin checks differently

-- Add a function to safely check if a user is admin
-- This can be used in other policies without causing recursion
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Use a direct query with explicit user_id to avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated, service_role;

-- Now we can create safe admin policies using the function
-- But we'll be careful to only use this where absolutely necessary

-- Update other tables to use the safe admin function instead of recursive queries
-- For courses table
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;

CREATE POLICY "Admins can view all courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR 
    instructor_id = auth.uid() OR 
    is_admin()
  );

CREATE POLICY "Admins can manage all courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- For other admin-related tables, we'll use similar safe patterns
-- Update enrollments policies
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;
CREATE POLICY "Admins can view all enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_admin()
  );

-- Add a note about the solution
COMMENT ON FUNCTION is_admin IS 'Safe admin check function that avoids recursion by checking auth.users metadata instead of profiles table';

-- Log the fix
DO $$
BEGIN
  RAISE NOTICE 'Fixed admin policy infinite recursion by removing recursive policies and implementing safe admin checks';
END $$;
```