-- =====================================================================
-- MODULE 5: WORKPLACE SECURITY CULTURE QUIZ WITH EXPLANATIONS
-- =====================================================================
-- Complete Module 5 assessment covering security-first mindset,
-- individual roles in security, gamified challenges, and continuous learning.
-- Includes detailed explanations for all questions and answer options.
-- =====================================================================

BEGIN;

-- Main execution block
DO $$
DECLARE
  course_uuid uuid;
  section_5_id uuid;  -- Module 5: Workplace Security Culture
  module5_assessment_id uuid;
  
BEGIN
  -- =====================================================================
  -- INITIAL SETUP AND VALIDATION
  -- =====================================================================
  
  -- Find the cybersecurity course
  SELECT id INTO course_uuid 
  FROM courses 
  WHERE title ILIKE '%cybersecurity%' 
  LIMIT 1;
  
  IF course_uuid IS NULL THEN
    RAISE EXCEPTION 'Cybersecurity course not found. Please create the course first.';
  END IF;
  
  RAISE NOTICE 'Found course: % (%)', 
    (SELECT title FROM courses WHERE id = course_uuid), 
    course_uuid;
  
  -- Find Module 5 section with multiple matching strategies
  -- Strategy 1: Look for "Module 5" specifically
  SELECT id INTO section_5_id 
  FROM course_sections 
  WHERE course_id = course_uuid 
    AND title ILIKE '%module 5%'
  LIMIT 1;
  
  -- Strategy 2: Look for "Security Culture" or related terms
  IF section_5_id IS NULL THEN
    SELECT id INTO section_5_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
      AND (title ILIKE '%security culture%' 
           OR title ILIKE '%workplace security%'
           OR title ILIKE '%security mindset%')
    LIMIT 1;
  END IF;
  
  -- Strategy 3: Use fifth section by order
  IF section_5_id IS NULL THEN
    SELECT id INTO section_5_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
    ORDER BY order_index 
    OFFSET 4 LIMIT 1;
  END IF;
  
  -- Approach 4: Create assessment without section if no sections exist
  IF section_5_id IS NULL THEN
    RAISE NOTICE 'No Module 5 section found. Creating course-level assessment.';
    -- We'll set section_5_id to NULL for course-level assessment
  ELSE
    RAISE NOTICE 'Using section: % (%)', 
      section_5_id, 
      (SELECT title FROM course_sections WHERE id = section_5_id);
  END IF;
  
  -- =====================================================================
  -- MODULE 5: WORKPLACE SECURITY CULTURE QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_5_id,  -- This can be NULL for course-level assessment
    'Module 5: Workplace Security Culture Quiz',
    'Assessment covering security-first mindset, individual security roles, continuous learning practices, and building strong workplace security culture.',
    'quiz', 20, 3, 70, true, 5
  ) RETURNING id INTO module5_assessment_id;
  
  -- =====================================================================
  -- MODULE 5 QUESTIONS WITH DETAILED EXPLANATIONS AND OPTIONS
  -- =====================================================================
  
  -- Question 1: Security-first mindset
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'What does having a "security-first mindset" mean in the workplace?', 
   'multiple_choice',
   '["Always prioritizing security over productivity", "Considering security implications before taking actions", "Only focusing on technical security measures", "Avoiding all technology to prevent risks"]'::jsonb,
   'Considering security implications before taking actions',
   'A security-first mindset means integrating security considerations into decision-making processes before acting. This doesn''t mean stopping all work for security, but rather evaluating risks and implementing appropriate safeguards. It balances security with productivity and involves both technical and human factors.',
   3, 1);

  -- Question 2: Individual role in security
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'How does each employee contribute to organizational security? (Select all that apply)', 
   'multiple_correct',
   '["Following security policies and procedures", "Reporting suspicious activities and incidents", "Keeping security knowledge current", "Taking personal responsibility for security decisions", "Assuming security is only IT department responsibility", "Participating in security training programs"]'::jsonb,
   '["Following security policies and procedures", "Reporting suspicious activities and incidents", "Keeping security knowledge current", "Taking personal responsibility for security decisions", "Participating in security training programs"]',
   'Every employee is part of the security chain: following policies ensures consistent protection, reporting enables quick response to threats, continuous learning keeps defenses current, personal responsibility prevents security gaps, and training participation builds organizational capability. Security is everyone''s responsibility, not just IT.',
   4, 2);

  -- Question 3: Security awareness benefits
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'What are the benefits of strong security awareness across an organization? (Select all that apply)', 
   'multiple_correct',
   '["Reduced risk of successful cyber attacks", "Faster incident detection and response", "Lower security-related costs", "Improved regulatory compliance", "Increased employee productivity", "Enhanced customer trust"]'::jsonb,
   '["Reduced risk of successful cyber attacks", "Faster incident detection and response", "Lower security-related costs", "Improved regulatory compliance", "Enhanced customer trust"]',
   'Security awareness creates multiple organizational benefits: educated employees prevent attacks, quick detection limits damage, prevention costs less than remediation, compliance avoids penalties, and strong security builds customer confidence. While security training takes time, the long-term productivity gains from avoiding incidents outweigh initial investment.',
   4, 3);

  -- Question 4: Security culture characteristics
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'What characterizes a strong workplace security culture?', 
   'multiple_choice',
   '["Fear-based compliance with security rules", "Open communication about security concerns without blame", "Security responsibilities limited to IT staff only", "Ignoring security to focus on business goals"]'::jsonb,
   'Open communication about security concerns without blame',
   'Strong security culture encourages open communication where employees feel safe reporting security concerns, mistakes, and potential threats without fear of punishment. This creates a learning environment that continuously improves security. Fear-based cultures discourage reporting, while limiting security to IT creates dangerous gaps.',
   3, 4);

  -- Question 5: Continuous learning importance
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'Why is continuous security learning essential for all employees? (Select all that apply)', 
   'multiple_correct',
   '["Cyber threats constantly evolve and change", "New technologies introduce new security risks", "Regulations and compliance requirements update", "Attack methods become more sophisticated", "One-time training is sufficient for career-long protection", "Security best practices improve over time"]'::jsonb,
   '["Cyber threats constantly evolve and change", "New technologies introduce new security risks", "Regulations and compliance requirements update", "Attack methods become more sophisticated", "Security best practices improve over time"]',
   'Continuous learning is essential because the security landscape constantly changes: new threats emerge daily, technology adoption creates new attack surfaces, regulations evolve with new privacy concerns, attackers develop sophisticated methods, and security practices improve through research and experience. One-time training quickly becomes obsolete.',
   4, 5);

  -- Question 6: Gamification in security training
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'How can gamification improve security training effectiveness?', 
   'multiple_choice',
   '["By making training more competitive and stressful", "By increasing engagement and retention through interactive challenges", "By replacing all serious security education", "By focusing only on entertainment value"]'::jsonb,
   'By increasing engagement and retention through interactive challenges',
   'Gamification improves learning by leveraging psychological principles: interactive challenges increase engagement, immediate feedback reinforces correct behaviors, progression systems maintain motivation, and scenario-based learning improves retention. The goal is enhanced learning outcomes, not entertainment, and it supplements rather than replaces comprehensive security education.',
   2, 6);

  -- Question 7: Security incident learning
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'How should organizations handle security incidents to promote learning? (Select all that apply)', 
   'multiple_correct',
   '["Conduct blame-free post-incident reviews", "Share lessons learned across the organization", "Focus on punishment to prevent recurrence", "Document root causes and improvement actions", "Keep incident details confidential from all employees", "Update policies and procedures based on findings"]'::jsonb,
   '["Conduct blame-free post-incident reviews", "Share lessons learned across the organization", "Document root causes and improvement actions", "Update policies and procedures based on findings"]',
   'Learning-focused incident handling emphasizes improvement over punishment: blame-free reviews encourage honest analysis, sharing lessons prevents similar incidents, root cause analysis identifies systemic issues, and policy updates address identified gaps. Punishment discourages reporting, while appropriate information sharing helps everyone learn.',
   4, 7);

  -- Question 8: Security champion programs
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'What is the purpose of security champion programs in organizations?', 
   'multiple_choice',
   '["To identify employees who violate security policies", "To create security advocates and mentors within each department", "To replace professional security staff", "To increase security team authority over other departments"]'::jsonb,
   'To create security advocates and mentors within each department',
   'Security champion programs identify enthusiastic employees who promote security awareness within their departments, serve as first points of contact for security questions, and help bridge the gap between security teams and business units. They extend security expertise throughout the organization without replacing professional security staff.',
   3, 8);

  -- Question 9: Measuring security culture
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'Which metrics can help measure the strength of an organization''s security culture? (Select all that apply)', 
   'multiple_correct',
   '["Number of security incidents reported by employees", "Participation rates in security training", "Results of simulated phishing tests", "Employee security survey responses", "Number of security policies created", "Time to detect and respond to incidents"]'::jsonb,
   '["Number of security incidents reported by employees", "Participation rates in security training", "Results of simulated phishing tests", "Employee security survey responses", "Time to detect and respond to incidents"]',
   'Security culture metrics reflect employee engagement and behavior: incident reporting indicates trust and awareness, training participation shows commitment, phishing test results measure practical application, surveys reveal attitudes and knowledge, and detection/response times reflect organizational capability. Policy quantity doesn''t indicate cultural strength.',
   4, 9);

  -- Question 10: Leadership role in security culture
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module5_assessment_id, 
   'How do leaders influence organizational security culture?', 
   'multiple_choice',
   '["By delegating all security responsibilities to IT", "By modeling security behaviors and making security a visible priority", "By focusing only on compliance requirements", "By avoiding security discussions to prevent worry"]'::jsonb,
   'By modeling security behaviors and making security a visible priority',
   'Leaders shape culture through visible commitment: modeling security behaviors demonstrates importance, making security a visible priority allocates necessary resources, regular communication reinforces expectations, and leadership support empowers security initiatives. Delegation without engagement or avoiding security discussions undermines cultural development.',
   3, 10);

  -- =====================================================================
  -- COMPLETION AND VERIFICATION
  -- =====================================================================
  
  RAISE NOTICE 'Successfully created Module 5 Workplace Security Culture Quiz with explanations and options';
  RAISE NOTICE '- Total questions: %', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module5_assessment_id);
  RAISE NOTICE '- Assessment ID: %', module5_assessment_id;
  RAISE NOTICE '- Section ID: %', section_5_id;
  
END $$;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Display the created assessment
SELECT 
  a.title as assessment_title,
  a.assessment_type,
  COUNT(aq.id) as question_count,
  a.time_limit_minutes,
  a.max_attempts,
  a.passing_score
FROM assessments a
LEFT JOIN assessment_questions aq ON a.id = aq.assessment_id
WHERE a.title = 'Module 5: Workplace Security Culture Quiz'
GROUP BY a.id, a.title, a.assessment_type, a.time_limit_minutes, a.max_attempts, a.passing_score;

-- Display all questions with their explanations and options
SELECT 
  aq.order_index,
  aq.question_text,
  aq.question_type,
  aq.options,
  aq.correct_answer,
  aq.explanation,
  aq.points
FROM assessment_questions aq
JOIN assessments a ON aq.assessment_id = a.id
WHERE a.title = 'Module 5: Workplace Security Culture Quiz'
ORDER BY aq.order_index;

COMMIT; 