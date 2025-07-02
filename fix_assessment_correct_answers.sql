-- =====================================================================
-- FIX ASSESSMENT CORRECT ANSWERS FORMAT
-- =====================================================================
-- This script converts comma-separated correct answers to JSON format
-- for multiple_correct questions to fix parsing errors in the frontend.
-- =====================================================================

BEGIN;

-- Update multiple_correct questions with comma-separated correct answers
UPDATE assessment_questions 
SET correct_answer = CASE 
  -- Convert comma-separated strings to JSON arrays
  WHEN question_type = 'multiple_correct' 
    AND correct_answer IS NOT NULL 
    AND correct_answer != '' 
    AND correct_answer NOT LIKE '[%]'  -- Skip if already JSON format
  THEN 
    -- Convert comma-separated string to JSON array
    '[' || string_agg('"' || trim(unnest) || '"', ',') || ']'
  ELSE 
    correct_answer
END
FROM (
  SELECT 
    id,
    string_to_array(correct_answer, ',') as answer_array
  FROM assessment_questions 
  WHERE question_type = 'multiple_correct'
    AND correct_answer IS NOT NULL 
    AND correct_answer != ''
    AND correct_answer NOT LIKE '[%]'
) AS subquery
WHERE assessment_questions.id = subquery.id;

-- Alternative simpler approach using string manipulation
UPDATE assessment_questions 
SET correct_answer = '["' || replace(correct_answer, ',', '","') || '"]'
WHERE question_type = 'multiple_correct'
  AND correct_answer IS NOT NULL 
  AND correct_answer != ''
  AND correct_answer NOT LIKE '[%]'  -- Skip if already JSON format
  AND correct_answer LIKE '%,%';     -- Only if contains commas

-- Clean up any extra spaces in the JSON
UPDATE assessment_questions 
SET correct_answer = replace(replace(correct_answer, '", "', '","'), '" , "', '","')
WHERE question_type = 'multiple_correct'
  AND correct_answer LIKE '%", "%';

-- Verify the changes
SELECT 
  id,
  question_text,
  question_type,
  correct_answer,
  CASE 
    WHEN question_type = 'multiple_correct' THEN
      CASE 
        WHEN correct_answer::text ~ '^\[.*\]$' THEN '✓ Valid JSON'
        ELSE '✗ Invalid format'
      END
    ELSE 'N/A'
  END as format_status
FROM assessment_questions 
WHERE question_type = 'multiple_correct'
ORDER BY id;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERY
-- =====================================================================
-- Run this to check if all multiple_correct questions have valid JSON

SELECT 
  COUNT(*) as total_multiple_correct,
  COUNT(CASE WHEN correct_answer::text ~ '^\[.*\]$' THEN 1 END) as valid_json_format,
  COUNT(CASE WHEN correct_answer::text ~ '^\[.*\]$' THEN NULL ELSE 1 END) as invalid_format
FROM assessment_questions 
WHERE question_type = 'multiple_correct'
  AND correct_answer IS NOT NULL 
  AND correct_answer != ''; 