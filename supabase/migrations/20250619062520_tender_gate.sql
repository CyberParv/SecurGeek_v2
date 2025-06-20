/*
  # Enhanced Course Structure with Sections and Assessments

  1. New Tables
    - `course_sections` - Organize lessons into sections
    - `assessments` - Mid-term and final exams
    - `assessment_questions` - Questions for assessments
    - `assessment_attempts` - User assessment attempts

  2. Updates
    - Modify lessons table to include section_id and video_url
    - Add proper ordering and structure

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for admin management
*/

-- Create course sections table
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, order_index)
);

-- Create assessments table (for mid-term and final exams)
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assessment_type text NOT NULL CHECK (assessment_type IN ('midterm', 'final', 'quiz')),
  instructions text,
  time_limit_minutes integer,
  passing_score integer DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts integer DEFAULT 3,
  is_required boolean DEFAULT true,
  is_published boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assessment questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type quiz_question_type DEFAULT 'multiple_choice',
  options jsonb, -- For multiple choice options
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, order_index)
);

-- Create assessment attempts table
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  total_points integer DEFAULT 0,
  earned_points integer DEFAULT 0,
  answers jsonb, -- Store user answers
  passed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  time_taken_minutes integer DEFAULT 0
);

-- Add section_id to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES course_sections(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url text;

-- Update lessons table to make section_id required for new lessons
-- (existing lessons without sections will need to be handled separately)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_sections_course ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_order ON course_sections(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_assessments_course ON assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user ON assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section_id);

-- Enable Row Level Security
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_sections
CREATE POLICY "Anyone can view published course sections"
  ON course_sections FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Instructors can manage their course sections"
  ON course_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all course sections"
  ON course_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for assessments
CREATE POLICY "Users can view published assessments of enrolled courses"
  ON assessments FOR SELECT
  TO authenticated
  USING (
    is_published = true AND (
      EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.user_id = auth.uid() AND e.course_id = assessments.course_id
      ) OR
      EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = course_id AND c.instructor_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Instructors can manage their course assessments"
  ON assessments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assessments"
  ON assessments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for assessment_questions
CREATE POLICY "Users can view questions of accessible assessments"
  ON assessment_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN enrollments e ON e.course_id = a.course_id
      WHERE a.id = assessment_id AND e.user_id = auth.uid() AND a.is_published = true
    ) OR
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = assessment_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Instructors can manage their assessment questions"
  ON assessment_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = assessment_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assessment questions"
  ON assessment_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for assessment_attempts
CREATE POLICY "Users can view their own assessment attempts"
  ON assessment_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assessment attempts"
  ON assessment_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own assessment attempts"
  ON assessment_attempts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can view attempts for their courses"
  ON assessment_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = assessment_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all assessment attempts"
  ON assessment_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_course_sections_updated_at 
  BEFORE UPDATE ON course_sections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at 
  BEFORE UPDATE ON assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_questions_updated_at 
  BEFORE UPDATE ON assessment_questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default sections for existing courses that don't have any
INSERT INTO course_sections (course_id, title, description, order_index)
SELECT 
  id as course_id,
  'Course Content' as title,
  'Main course content and lessons' as description,
  1 as order_index
FROM courses 
WHERE id NOT IN (SELECT DISTINCT course_id FROM course_sections WHERE course_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Update existing lessons to belong to the default section
UPDATE lessons 
SET section_id = (
  SELECT cs.id 
  FROM course_sections cs 
  WHERE cs.course_id = lessons.course_id 
  AND cs.order_index = 1
  LIMIT 1
)
WHERE section_id IS NULL;