/*
  # Fix Admin User Update Policies

  1. Security Policy Updates
    - Add proper admin policies for updating user profiles
    - Allow admins to update any user profile
    - Fix RLS policies that prevent admin user management

  2. Changes
    - Drop conflicting policies
    - Add comprehensive admin update policy
    - Ensure admins can manage all user data
*/

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;

-- Create a comprehensive admin update policy
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'::user_role
    )
  );

-- Also ensure admins can delete profiles if needed
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'::user_role
    )
  );

-- Ensure admins can insert new profiles
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;
CREATE POLICY "Admins can create profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'::user_role
    )
  );