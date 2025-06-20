/*
  # Fix Course Editor RLS Policies

  1. Security Policy Updates
    - Drop existing conflicting policies safely
    - Add comprehensive RLS policies for all course management tables
    - Ensure admin and instructor access for course editing

  2. Tables Updated
    - lessons: Admin and instructor management policies
    - assessments: Admin and instructor management policies  
    - quizzes: Complete policy coverage
    - quiz_questions: Proper access control
    - quiz_attempts: User and admin access
    - resources: Course resource management
    - reviews: Review management
    - certificates: Certificate access control
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
DROP POLICY IF EXISTS "Instructors can manage their course lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage all assessments" ON assessments;
DROP POLICY IF EXISTS "Instructors can manage their course assessments" ON assessments;
DROP POLICY IF EXISTS "Admins can manage all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Instructors can manage their course quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view published quizzes of enrolled courses" ON quizzes;
DROP POLICY IF EXISTS "Admins can manage all quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Instructors can manage their quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can view questions of accessible quizzes" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can view all quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can view attempts for their courses" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Admins can manage all resources" ON resources;
DROP POLICY IF EXISTS "Instructors can manage their course resources" ON resources;
DROP POLICY IF EXISTS "Users can view resources of enrolled courses" ON resources;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage their own reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
DROP POLICY IF EXISTS "Instructors can view certificates for their courses" ON certificates;
DROP POLICY IF EXISTS "System can create certificates" ON certificates;

-- Add RLS policies for lessons table
CREATE POLICY "Admins can manage all lessons"
  ON lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Instructors can manage their course lessons"
  ON lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = lessons.course_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = lessons.course_id AND c.instructor_id = auth.uid()
    )
  );

-- Add RLS policies for assessments table
CREATE POLICY "Admins can manage all assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Instructors can manage their course assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = assessments.course_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = assessments.course_id AND c.instructor_id = auth.uid()
    )
  );

-- Add RLS policies for quizzes table
CREATE POLICY "Admins can manage all quizzes"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Instructors can manage their course quizzes"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
    )) OR
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lessons l
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = quizzes.lesson_id AND c.instructor_id = auth.uid()
    ))
  )
  WITH CHECK (
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
    )) OR
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lessons l
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = quizzes.lesson_id AND c.instructor_id = auth.uid()
    ))
  );

CREATE POLICY "Users can view published quizzes of enrolled courses"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid() AND e.course_id = quizzes.course_id
    )) OR
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lessons l
      JOIN enrollments e ON e.course_id = l.course_id
      WHERE l.id = quizzes.lesson_id AND e.user_id = auth.uid()
    ))
  );

-- Add RLS policies for quiz_questions table
CREATE POLICY "Admins can manage all quiz questions"
  ON quiz_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Instructors can manage their quiz questions"
  ON quiz_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      LEFT JOIN courses c ON c.id = q.course_id
      LEFT JOIN lessons l ON l.id = q.lesson_id
      LEFT JOIN courses c2 ON c2.id = l.course_id
      WHERE q.id = quiz_questions.quiz_id 
      AND (c.instructor_id = auth.uid() OR c2.instructor_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes q
      LEFT JOIN courses c ON c.id = q.course_id
      LEFT JOIN lessons l ON l.id = q.lesson_id
      LEFT JOIN courses c2 ON c2.id = l.course_id
      WHERE q.id = quiz_questions.quiz_id 
      AND (c.instructor_id = auth.uid() OR c2.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Users can view questions of accessible quizzes"
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      LEFT JOIN courses c ON c.id = q.course_id
      LEFT JOIN lessons l ON l.id = q.lesson_id
      LEFT JOIN enrollments e1 ON e1.course_id = c.id
      LEFT JOIN enrollments e2 ON e2.course_id = l.course_id
      WHERE q.id = quiz_questions.quiz_id 
      AND (e1.user_id = auth.uid() OR e2.user_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

-- Add RLS policies for quiz_attempts table
CREATE POLICY "Admins can view all quiz attempts"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Instructors can view attempts for their courses"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      LEFT JOIN courses c ON c.id = q.course_id
      LEFT JOIN lessons l ON l.id = q.lesson_id
      LEFT JOIN courses c2 ON c2.id = l.course_id
      WHERE q.id = quiz_attempts.quiz_id 
      AND (c.instructor_id = auth.uid() OR c2.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own quiz attempts"
  ON quiz_attempts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add RLS policies for resources table
CREATE POLICY "Admins can manage all resources"
  ON resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Instructors can manage their course resources"
  ON resources
  FOR ALL
  TO authenticated
  USING (
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = resources.course_id AND c.instructor_id = auth.uid()
    )) OR
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lessons l
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = resources.lesson_id AND c.instructor_id = auth.uid()
    ))
  )
  WITH CHECK (
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = resources.course_id AND c.instructor_id = auth.uid()
    )) OR
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lessons l
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = resources.lesson_id AND c.instructor_id = auth.uid()
    ))
  );

CREATE POLICY "Users can view resources of enrolled courses"
  ON resources
  FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid() AND e.course_id = resources.course_id
    )) OR
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lessons l
      JOIN enrollments e ON e.course_id = l.course_id
      WHERE l.id = resources.lesson_id AND e.user_id = auth.uid()
    )) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

-- Add RLS policies for reviews table
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Users can manage their own reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view approved reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (is_approved = true);

-- Add RLS policies for certificates table
CREATE POLICY "Admins can manage all certificates"
  ON certificates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Users can view their own certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can view certificates for their courses"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = certificates.course_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "System can create certificates"
  ON certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);