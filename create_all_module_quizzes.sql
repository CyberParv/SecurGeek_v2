-- Complete Quiz System for All Modules (2-5)
-- This script creates comprehensive quizzes for Modules 2, 3, 4, and 5

BEGIN;

-- Get the course ID
DO $$
DECLARE
  course_uuid uuid;
  section_2_id uuid;  -- Module 2: Safe Internet Practices
  section_3_id uuid;  -- Module 3: Social Engineering & Phishing
  section_4_id uuid;  -- Module 4: Data Protection
  section_5_id uuid;  -- Module 5: Security Culture
  module2_assessment_id uuid;
  module3_assessment_id uuid;
  module4_assessment_id uuid;
  module5_assessment_id uuid;
  
BEGIN
  -- Get course ID
  SELECT id INTO course_uuid 
  FROM courses 
  WHERE title = 'Introduction to Cybersecurity' 
  LIMIT 1;
  
  IF course_uuid IS NULL THEN
    RAISE EXCEPTION 'Course not found. Please ensure the cybersecurity course exists.';
  END IF;
  
  -- Get section IDs
  SELECT id INTO section_2_id FROM course_sections WHERE course_id = course_uuid AND (title LIKE '%Module 2%' OR title LIKE '%Safe Internet%') ORDER BY order_index LIMIT 1;
  SELECT id INTO section_3_id FROM course_sections WHERE course_id = course_uuid AND (title LIKE '%Module 3%' OR title LIKE '%Social Engineering%') ORDER BY order_index LIMIT 1;
  SELECT id INTO section_4_id FROM course_sections WHERE course_id = course_uuid AND (title LIKE '%Module 4%' OR title LIKE '%Data Protection%') ORDER BY order_index LIMIT 1;
  SELECT id INTO section_5_id FROM course_sections WHERE course_id = course_uuid AND (title LIKE '%Module 5%' OR title LIKE '%Security Culture%') ORDER BY order_index LIMIT 1;
  
  -- ========== MODULE 2: SAFE INTERNET PRACTICES QUIZ ==========
  INSERT INTO assessments (
    course_id, section_id, title, description, type, time_limit, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_2_id,
    'Module 2: Safe Internet Practices Quiz',
    'Assessment covering safe browsing, public Wi-Fi security, remote work best practices, and incident response procedures.',
    'quiz', 1200, 3, 70, true, 2
  );
  
  SELECT id INTO module2_assessment_id FROM assessments WHERE title = 'Module 2: Safe Internet Practices Quiz' AND course_id = course_uuid;
  
  -- Module 2 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (module2_assessment_id, 'What is the primary security risk when using public Wi-Fi networks?', 'multiple_choice', 2, 1),
  (module2_assessment_id, 'Which of the following are essential practices for safe internet browsing? (Select all that apply)', 'multiple_select', 4, 2),
  (module2_assessment_id, 'When working remotely, what security measures should you implement? (Select all that apply)', 'multiple_select', 4, 3),
  (module2_assessment_id, 'What should you do immediately upon discovering a potential security incident?', 'multiple_choice', 3, 4),
  (module2_assessment_id, 'Which browser security feature helps protect against malicious websites?', 'multiple_choice', 2, 5),
  (module2_assessment_id, 'What makes a download source trustworthy?', 'multiple_select', 3, 6),
  (module2_assessment_id, 'How can you verify if a website connection is secure?', 'multiple_choice', 2, 7),
  (module2_assessment_id, 'What is the purpose of automatic software updates?', 'multiple_choice', 2, 8);
  
  -- ========== MODULE 3: SOCIAL ENGINEERING & PHISHING QUIZ ==========
  INSERT INTO assessments (
    course_id, section_id, title, description, type, time_limit, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_3_id,
    'Module 3: Social Engineering & Phishing Defense Quiz',
    'Comprehensive assessment on identifying and defending against social engineering attacks, phishing, spear phishing, and business email compromise.',
    'quiz', 1500, 3, 70, true, 3
  );
  
  SELECT id INTO module3_assessment_id FROM assessments WHERE title = 'Module 3: Social Engineering & Phishing Defense Quiz' AND course_id = course_uuid;
  
  -- Module 3 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (module3_assessment_id, 'What is the primary goal of social engineering attacks?', 'multiple_choice', 2, 1),
  (module3_assessment_id, 'Which of the following are common social engineering techniques? (Select all that apply)', 'multiple_select', 4, 2),
  (module3_assessment_id, 'How does spear phishing differ from regular phishing?', 'multiple_choice', 3, 3),
  (module3_assessment_id, 'What characterizes a Business Email Compromise (BEC) attack?', 'multiple_choice', 3, 4),
  (module3_assessment_id, 'If you accidentally click a malicious link, what should you do first?', 'multiple_choice', 3, 5),
  (module3_assessment_id, 'Which of these are red flags in a potential phishing email? (Select all that apply)', 'multiple_select', 4, 6),
  (module3_assessment_id, 'What is "vishing"?', 'multiple_choice', 2, 7),
  (module3_assessment_id, 'How can organizations best defend against social engineering?', 'multiple_select', 4, 8),
  (module3_assessment_id, 'What makes someone more susceptible to social engineering attacks?', 'multiple_select', 3, 9),
  (module3_assessment_id, 'Describe a scenario where you might encounter social engineering and how you would respond.', 'essay', 5, 10);
  
  -- ========== MODULE 4: DATA PROTECTION QUIZ ==========
  INSERT INTO assessments (
    course_id, section_id, title, description, type, time_limit, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_4_id,
    'Module 4: Data Protection & Privacy Quiz',
    'Assessment covering data classification, privacy regulations, secure data handling, breach response, and mobile device security.',
    'quiz', 1200, 3, 70, true, 4
  );
  
  SELECT id INTO module4_assessment_id FROM assessments WHERE title = 'Module 4: Data Protection & Privacy Quiz' AND course_id = course_uuid;
  
  -- Module 4 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (module4_assessment_id, 'Which types of data are considered "sensitive" and require special protection? (Select all that apply)', 'multiple_select', 4, 1),
  (module4_assessment_id, 'What is the most important principle when handling customer personal data?', 'multiple_choice', 2, 2),
  (module4_assessment_id, 'Under GDPR, what rights do individuals have regarding their personal data? (Select all that apply)', 'multiple_select', 4, 3),
  (module4_assessment_id, 'What constitutes a data breach that must be reported?', 'multiple_choice', 3, 4),
  (module4_assessment_id, 'Which mobile device security practices are essential? (Select all that apply)', 'multiple_select', 4, 5),
  (module4_assessment_id, 'How should you securely dispose of devices containing sensitive data?', 'multiple_choice', 3, 6),
  (module4_assessment_id, 'What is the principle of "data minimization"?', 'multiple_choice', 2, 7),
  (module4_assessment_id, 'When is it appropriate to share customer data with third parties?', 'multiple_choice', 3, 8),
  (module4_assessment_id, 'What should you do if you discover personal data has been accidentally exposed?', 'multiple_choice', 3, 9);
  
  -- ========== MODULE 5: SECURITY CULTURE QUIZ ==========
  INSERT INTO assessments (
    course_id, section_id, title, description, type, time_limit, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_5_id,
    'Module 5: Building Security Culture Quiz',
    'Final module assessment on developing security awareness, continuous learning, shared responsibility, and creating a security-first organizational culture.',
    'quiz', 1200, 3, 70, true, 5
  );
  
  SELECT id INTO module5_assessment_id FROM assessments WHERE title = 'Module 5: Building Security Culture Quiz' AND course_id = course_uuid;
  
  -- Module 5 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (module5_assessment_id, 'What does it mean to have a "security-first mindset"?', 'multiple_choice', 3, 1),
  (module5_assessment_id, 'How can employees contribute to building a strong security culture? (Select all that apply)', 'multiple_select', 4, 2),
  (module5_assessment_id, 'Why is continuous cybersecurity learning important for all employees?', 'multiple_choice', 2, 3),
  (module5_assessment_id, 'What is the "shared responsibility model" in cybersecurity?', 'multiple_choice', 3, 4),
  (module5_assessment_id, 'Which behaviors demonstrate good security awareness? (Select all that apply)', 'multiple_select', 4, 5),
  (module5_assessment_id, 'How should organizations approach cybersecurity training?', 'multiple_choice', 2, 6),
  (module5_assessment_id, 'What role does leadership play in security culture?', 'multiple_choice', 3, 7),
  (module5_assessment_id, 'How can you stay updated on emerging cybersecurity threats?', 'multiple_select', 3, 8),
  (module5_assessment_id, 'Describe three ways you will apply cybersecurity principles in your daily work after completing this course.', 'essay', 6, 9);
  
  -- ADD SAMPLE ANSWER OPTIONS FOR KEY QUESTIONS
  
  -- Module 2 Sample Options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary security risk when using public Wi-Fi%' AND assessment_id = module2_assessment_id), 'Man-in-the-middle attacks and data interception', true, 'Correct! Public Wi-Fi allows attackers to intercept unencrypted data.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary security risk when using public Wi-Fi%' AND assessment_id = module2_assessment_id), 'Slower internet speeds', false, 'Speed is not a security risk.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary security risk when using public Wi-Fi%' AND assessment_id = module2_assessment_id), 'Higher data usage costs', false, 'Cost is not a security concern.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary security risk when using public Wi-Fi%' AND assessment_id = module2_assessment_id), 'Limited bandwidth availability', false, 'Bandwidth is not a security issue.');
  
  -- Module 3 Sample Options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of social engineering%' AND assessment_id = module3_assessment_id), 'To manipulate people into revealing information or performing actions', true, 'Correct! Social engineering exploits human psychology rather than technical vulnerabilities.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of social engineering%' AND assessment_id = module3_assessment_id), 'To break into computer systems directly', false, 'This describes technical hacking, not social engineering.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of social engineering%' AND assessment_id = module3_assessment_id), 'To sell products or services', false, 'This is marketing, not social engineering.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of social engineering%' AND assessment_id = module3_assessment_id), 'To improve social media engagement', false, 'This is not related to cybersecurity attacks.');
  
  -- Module 4 Sample Options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%most important principle when handling customer personal data%' AND assessment_id = module4_assessment_id), 'Only collect and use data for legitimate business purposes', true, 'Correct! Data minimization and purpose limitation are fundamental privacy principles.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%most important principle when handling customer personal data%' AND assessment_id = module4_assessment_id), 'Collect as much data as possible for future use', false, 'This violates data minimization principles.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%most important principle when handling customer personal data%' AND assessment_id = module4_assessment_id), 'Share data freely within the organization', false, 'Data should only be shared on a need-to-know basis.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%most important principle when handling customer personal data%' AND assessment_id = module4_assessment_id), 'Store data indefinitely for record keeping', false, 'Data should be deleted when no longer needed.');
  
  -- Module 5 Sample Options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%security-first mindset%' AND assessment_id = module5_assessment_id), 'Considering security implications in all decisions and actions', true, 'Correct! A security-first mindset means prioritizing security in everything you do.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%security-first mindset%' AND assessment_id = module5_assessment_id), 'Only thinking about security during training sessions', false, 'Security should be considered continuously, not just during training.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%security-first mindset%' AND assessment_id = module5_assessment_id), 'Leaving security decisions to IT specialists', false, 'Everyone shares responsibility for security.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%security-first mindset%' AND assessment_id = module5_assessment_id), 'Focusing only on technical security measures', false, 'Security involves both technical and human elements.');
  
  RAISE NOTICE 'Successfully created quizzes for all modules (2-5)';
  
END $$;

-- Verify all quizzes were created
SELECT 
  a.title as assessment_title,
  COUNT(aq.id) as question_count,
  a.time_limit/60 as time_limit_minutes,
  a.max_attempts,
  a.passing_score
FROM assessments a
LEFT JOIN assessment_questions aq ON a.id = aq.assessment_id
WHERE a.title LIKE 'Module%Quiz'
GROUP BY a.id, a.title, a.time_limit, a.max_attempts, a.passing_score
ORDER BY a.order_index;

COMMIT; 