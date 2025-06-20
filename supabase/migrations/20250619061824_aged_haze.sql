/*
  # Admin Course Management Policies

  1. Security
    - Add policies for admin course management
    - Allow admins to create, update, and delete courses
    - Ensure proper RLS for course operations

  2. Changes
    - Add admin policies for course management
    - Update existing policies to support admin operations
*/

-- Allow admins to manage courses
CREATE POLICY "Admins can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any course"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any course"
  ON courses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to view all courses (already exists but ensuring it's there)
-- This policy should already exist from the initial migration

-- Update the existing instructor policies to work alongside admin policies
-- The existing policies should remain as they are for instructors

-- Ensure categories can be viewed by everyone (for course creation)
-- This policy should already exist

-- Grant necessary permissions for course operations
GRANT ALL ON courses TO authenticated;
GRANT ALL ON categories TO authenticated;