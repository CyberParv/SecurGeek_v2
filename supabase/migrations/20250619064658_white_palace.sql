/*
  # Add section_id to assessments table

  1. Changes
    - Add section_id column to assessments table
    - Add foreign key constraint linking assessments to course_sections
    - Update existing assessments to have null section_id (they can be course-level)

  2. Security
    - Maintain existing RLS policies
*/

-- Add section_id column to assessments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'section_id'
  ) THEN
    ALTER TABLE assessments ADD COLUMN section_id uuid;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'assessments_section_id_fkey'
  ) THEN
    ALTER TABLE assessments 
    ADD CONSTRAINT assessments_section_id_fkey 
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_assessments_section'
  ) THEN
    CREATE INDEX idx_assessments_section ON assessments(section_id);
  END IF;
END $$;