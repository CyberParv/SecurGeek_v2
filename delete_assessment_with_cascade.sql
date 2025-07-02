-- =====================================================================
-- ASSESSMENT DELETION WITH CASCADE DEMONSTRATION
-- =====================================================================
-- This script demonstrates and provides utilities for deleting assessments
-- with automatic cascade deletion of all related data:
-- - assessment_questions (automatically deleted via CASCADE)
-- - assessment_attempts (automatically deleted via CASCADE)
-- =====================================================================

-- =====================================================================
-- VERIFY CASCADE RELATIONSHIPS ARE PROPERLY SET UP
-- =====================================================================

-- Check foreign key constraints for assessment_questions
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'assessment_questions'
    AND ccu.table_name = 'assessments';

-- Check foreign key constraints for assessment_attempts
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'assessment_attempts'
    AND ccu.table_name = 'assessments';

-- =====================================================================
-- FUNCTION TO SAFELY DELETE AN ASSESSMENT WITH REPORTING
-- =====================================================================

CREATE OR REPLACE FUNCTION delete_assessment_with_report(assessment_title_param TEXT)
RETURNS TABLE(
    action TEXT,
    table_name TEXT,
    records_affected INTEGER,
    details TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    target_assessment_id uuid;
    questions_count INTEGER;
    attempts_count INTEGER;
    assessment_info RECORD;
BEGIN
    -- Find the assessment
    SELECT id, title, assessment_type, course_id 
    INTO target_assessment_id, assessment_info.title, assessment_info.assessment_type, assessment_info.course_id
    FROM assessments 
    WHERE title = assessment_title_param
    LIMIT 1;
    
    IF target_assessment_id IS NULL THEN
        RETURN QUERY SELECT 
            'ERROR'::TEXT,
            'assessments'::TEXT,
            0::INTEGER,
            'Assessment not found: ' || assessment_title_param;
        RETURN;
    END IF;
    
    -- Count related records before deletion
    SELECT COUNT(*) INTO questions_count 
    FROM assessment_questions 
    WHERE assessment_id = target_assessment_id;
    
    SELECT COUNT(*) INTO attempts_count 
    FROM assessment_attempts 
    WHERE assessment_id = target_assessment_id;
    
    -- Report what will be deleted
    RETURN QUERY SELECT 
        'BEFORE_DELETE'::TEXT,
        'assessment_info'::TEXT,
        1::INTEGER,
        'Assessment: ' || assessment_info.title || ' (Type: ' || assessment_info.assessment_type || ')';
        
    RETURN QUERY SELECT 
        'BEFORE_DELETE'::TEXT,
        'assessment_questions'::TEXT,
        questions_count,
        'Questions that will be cascade deleted';
        
    RETURN QUERY SELECT 
        'BEFORE_DELETE'::TEXT,
        'assessment_attempts'::TEXT,
        attempts_count,
        'User attempts that will be cascade deleted';
    
    -- Perform the deletion (CASCADE will automatically delete related records)
    DELETE FROM assessments WHERE id = target_assessment_id;
    
    -- Report successful deletion
    RETURN QUERY SELECT 
        'DELETED'::TEXT,
        'assessments'::TEXT,
        1::INTEGER,
        'Assessment successfully deleted with all related data';
        
    RETURN QUERY SELECT 
        'CASCADE_DELETED'::TEXT,
        'assessment_questions'::TEXT,
        questions_count,
        'Questions automatically deleted via CASCADE';
        
    RETURN QUERY SELECT 
        'CASCADE_DELETED'::TEXT,
        'assessment_attempts'::TEXT,
        attempts_count,
        'User attempts automatically deleted via CASCADE';
        
END;
$$;

-- =====================================================================
-- FUNCTION TO LIST ALL ASSESSMENTS WITH RELATED DATA COUNTS
-- =====================================================================

CREATE OR REPLACE FUNCTION list_assessments_with_counts()
RETURNS TABLE(
    assessment_id uuid,
    title TEXT,
    assessment_type TEXT,
    course_title TEXT,
    question_count BIGINT,
    attempt_count BIGINT,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.id,
        a.title,
        a.assessment_type,
        c.title as course_title,
        COALESCE(q.question_count, 0) as question_count,
        COALESCE(at.attempt_count, 0) as attempt_count,
        a.created_at
    FROM assessments a
    JOIN courses c ON a.course_id = c.id
    LEFT JOIN (
        SELECT assessment_id, COUNT(*) as question_count
        FROM assessment_questions
        GROUP BY assessment_id
    ) q ON a.id = q.assessment_id
    LEFT JOIN (
        SELECT assessment_id, COUNT(*) as attempt_count
        FROM assessment_attempts
        GROUP BY assessment_id
    ) at ON a.id = at.assessment_id
    ORDER BY a.created_at DESC;
END;
$$;

-- =====================================================================
-- EXAMPLE USAGE AND DEMONSTRATION
-- =====================================================================

-- List all assessments with their related data counts
SELECT 'Current assessments:' as info;
SELECT * FROM list_assessments_with_counts();

-- Example: Delete a specific assessment (uncomment to use)
-- SELECT * FROM delete_assessment_with_report('Module 1: Cybersecurity Fundamentals Quiz');

-- =====================================================================
-- BATCH DELETE FUNCTIONS FOR CLEANUP
-- =====================================================================

-- Function to delete all assessments for a specific course
CREATE OR REPLACE FUNCTION delete_course_assessments(course_title_param TEXT)
RETURNS TABLE(
    action TEXT,
    assessment_title TEXT,
    questions_deleted INTEGER,
    attempts_deleted INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
    assessment_record RECORD;
    total_questions INTEGER := 0;
    total_attempts INTEGER := 0;
BEGIN
    -- Loop through all assessments for the course
    FOR assessment_record IN 
        SELECT a.id, a.title, a.assessment_type
        FROM assessments a
        JOIN courses c ON a.course_id = c.id
        WHERE c.title = course_title_param
    LOOP
        -- Count related records
        SELECT COUNT(*) INTO assessment_record.question_count
        FROM assessment_questions 
        WHERE assessment_id = assessment_record.id;
        
        SELECT COUNT(*) INTO assessment_record.attempt_count
        FROM assessment_attempts 
        WHERE assessment_id = assessment_record.id;
        
        total_questions := total_questions + assessment_record.question_count;
        total_attempts := total_attempts + assessment_record.attempt_count;
        
        -- Delete the assessment (CASCADE will handle related data)
        DELETE FROM assessments WHERE id = assessment_record.id;
        
        RETURN QUERY SELECT 
            'DELETED'::TEXT,
            assessment_record.title,
            assessment_record.question_count::INTEGER,
            assessment_record.attempt_count::INTEGER;
    END LOOP;
    
    -- Return summary
    RETURN QUERY SELECT 
        'SUMMARY'::TEXT,
        'Total for course: ' || course_title_param,
        total_questions,
        total_attempts;
END;
$$;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Query to verify CASCADE deletion worked properly
-- (Run this after deleting an assessment to confirm no orphaned records)
CREATE OR REPLACE FUNCTION verify_no_orphaned_data()
RETURNS TABLE(
    table_name TEXT,
    orphaned_count BIGINT,
    status TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check for orphaned assessment_questions
    RETURN QUERY 
    SELECT 
        'assessment_questions'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'OK - No orphaned questions'
            ELSE 'ERROR - Found orphaned questions'
        END
    FROM assessment_questions aq
    LEFT JOIN assessments a ON aq.assessment_id = a.id
    WHERE a.id IS NULL;
    
    -- Check for orphaned assessment_attempts
    RETURN QUERY 
    SELECT 
        'assessment_attempts'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'OK - No orphaned attempts'
            ELSE 'ERROR - Found orphaned attempts'
        END
    FROM assessment_attempts aa
    LEFT JOIN assessments a ON aa.assessment_id = a.id
    WHERE a.id IS NULL;
END;
$$;

-- =====================================================================
-- EXAMPLE USAGE COMMANDS
-- =====================================================================

/*
-- To delete a specific assessment:
SELECT * FROM delete_assessment_with_report('Module 1: Cybersecurity Fundamentals Quiz');

-- To delete all assessments for a course:
SELECT * FROM delete_course_assessments('Introduction to Cybersecurity');

-- To list all assessments with counts:
SELECT * FROM list_assessments_with_counts();

-- To verify no orphaned data exists:
SELECT * FROM verify_no_orphaned_data();

-- To see the CASCADE relationships:
SELECT 'CASCADE relationships are already set up in the database schema';
SELECT 'When you DELETE FROM assessments WHERE id = [assessment_id];';
SELECT 'All related assessment_questions and assessment_attempts are automatically deleted';
*/ 