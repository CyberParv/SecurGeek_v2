/*
  # Add Multiple Correct Answer Question Type

  1. Changes
    - Add 'multiple_correct' to quiz_question_type enum
    - Update assessment interface to handle multiple correct answers
    - Add proper validation for multiple correct answer questions

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add the new question type to the existing enum
ALTER TYPE quiz_question_type ADD VALUE 'multiple_correct';

-- Add a comment to document the new question type
COMMENT ON TYPE quiz_question_type IS 'Question types: multiple_choice (single correct), multiple_correct (multiple correct), true_false, short_answer, essay';