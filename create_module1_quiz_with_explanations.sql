-- =====================================================================
-- MODULE 1: CYBERSECURITY FUNDAMENTALS QUIZ WITH EXPLANATIONS
-- =====================================================================
-- Complete Module 1 assessment covering cybersecurity basics, password 
-- security, common threats, business impact, and employee responsibilities.
-- Includes detailed explanations for all questions and answer options.
-- =====================================================================

BEGIN;

-- Main execution block
DO $$
DECLARE
  course_uuid uuid;
  section_1_id uuid;  -- Module 1: Cybersecurity Fundamentals
  module1_assessment_id uuid;
  
BEGIN
  -- =====================================================================
  -- INITIAL SETUP AND VALIDATION
  -- =====================================================================
  
  -- Get course ID
  SELECT id INTO course_uuid 
  FROM courses 
  WHERE title = 'Introduction to Cybersecurity' 
  LIMIT 1;
  
  IF course_uuid IS NULL THEN
    RAISE EXCEPTION 'Course not found. Please ensure the cybersecurity course exists.';
  END IF;
  
  RAISE NOTICE 'Found course: %', course_uuid;
  
  -- Debug: Show all available sections for this course
  RAISE NOTICE 'Available course sections:';
  FOR section_1_id IN 
    SELECT id FROM course_sections 
    WHERE course_id = course_uuid 
    ORDER BY order_index
  LOOP
    RAISE NOTICE '- Section ID: % | Title: %', 
      section_1_id, 
      (SELECT title FROM course_sections WHERE id = section_1_id);
  END LOOP;
  
  -- Try multiple approaches to find Module 1 section
  -- Approach 1: Look for Module 1 specifically
  SELECT id INTO section_1_id FROM course_sections 
  WHERE course_id = course_uuid 
  AND (title ILIKE '%Module 1%' OR title ILIKE '%module 1%')
  ORDER BY order_index LIMIT 1;
  
  -- Approach 2: Look for Introduction/Fundamentals
  IF section_1_id IS NULL THEN
    SELECT id INTO section_1_id FROM course_sections 
    WHERE course_id = course_uuid 
    AND (title ILIKE '%Introduction%' OR title ILIKE '%Fundamentals%' OR title ILIKE '%Basics%')
    ORDER BY order_index LIMIT 1;
  END IF;
  
  -- Approach 3: Use the first section if nothing else matches
  IF section_1_id IS NULL THEN
    SELECT id INTO section_1_id FROM course_sections 
    WHERE course_id = course_uuid 
    ORDER BY order_index LIMIT 1;
    
    IF section_1_id IS NOT NULL THEN
      RAISE NOTICE 'Using first available section as Module 1: %', 
        (SELECT title FROM course_sections WHERE id = section_1_id);
    END IF;
  END IF;
  
  -- Approach 4: Create assessment without section if no sections exist
  IF section_1_id IS NULL THEN
    RAISE NOTICE 'No course sections found. Creating course-level assessment.';
    -- We'll set section_1_id to NULL for course-level assessment
  ELSE
    RAISE NOTICE 'Using section: % (%)', 
      section_1_id, 
      (SELECT title FROM course_sections WHERE id = section_1_id);
  END IF;
  
  -- =====================================================================
  -- MODULE 1: CYBERSECURITY FUNDAMENTALS QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_1_id,  -- This can be NULL for course-level assessment
    'Module 1: Cybersecurity Fundamentals Quiz',
    'Comprehensive assessment covering cybersecurity basics, password security, common threats, business impact, and employee responsibilities.',
    'quiz', 30, 3, 70, true, 1
  ) RETURNING id INTO module1_assessment_id;
  
  -- =====================================================================
  -- MODULE 1 QUESTIONS WITH DETAILED EXPLANATIONS AND OPTIONS
  -- =====================================================================
  
  -- Question 1: Primary goal of cybersecurity
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'What is the primary goal of cybersecurity?', 
   'multiple_choice',
   '["To make systems completely unhackable", "To protect digital assets, data, and systems from unauthorized access and threats", "To eliminate all technology risks", "To prevent all cyber attacks"]'::jsonb,
   'To protect digital assets, data, and systems from unauthorized access and threats',
   'Cybersecurity''s primary goal is to protect the confidentiality, integrity, and availability (CIA triad) of digital assets. This includes preventing unauthorized access, maintaining data accuracy, and ensuring systems remain operational when needed. Complete elimination of risk is impossible, so cybersecurity focuses on risk management and mitigation.',
   2, 1);

  -- Question 2: Core principles of cybersecurity (CIA Triad)
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'Which of the following are core principles of cybersecurity? (Select all that apply)', 
   'multiple_correct',
   '["Confidentiality", "Integrity", "Availability", "Complexity", "Compatibility", "Convenience"]'::jsonb,
   '["Confidentiality", "Integrity", "Availability"]',
   'The CIA triad forms the foundation of cybersecurity: Confidentiality ensures information is only accessible to authorized parties, Integrity maintains data accuracy and prevents unauthorized modification, and Availability ensures systems and data are accessible when needed by authorized users. These three principles guide all cybersecurity decisions and implementations.',
   3, 2);

  -- Question 3: Strong password characteristics
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'What makes a password strong and secure? (Select all that apply)', 
   'multiple_correct',
   '["At least 12 characters long", "Mix of uppercase and lowercase letters", "Contains numbers and special characters", "Unique for each account", "Easy to remember personal information", "Contains dictionary words"]'::jsonb,
   '["At least 12 characters long", "Mix of uppercase and lowercase letters", "Contains numbers and special characters", "Unique for each account"]',
   'Strong passwords require multiple characteristics: Length (12+ characters) exponentially increases cracking time, character variety (upper/lower case, numbers, symbols) increases complexity, and uniqueness prevents credential stuffing attacks where one compromised password affects multiple accounts. Personal information and dictionary words make passwords predictable and vulnerable.',
   3, 3);

  -- Question 4: Worst password practice
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'Which of the following is the WORST password practice?', 
   'multiple_choice',
   '["Using the same password for multiple accounts", "Writing passwords down in a secure location", "Using a password manager", "Changing passwords periodically"]'::jsonb,
   'Using the same password for multiple accounts',
   'Password reuse is the worst practice because when one account is compromised, attackers can access all accounts using the same password. This is called "credential stuffing" and affects millions of users annually. Each account should have a unique password. Writing passwords down securely and using password managers are actually recommended practices.',
   2, 4);

  -- Question 5: Two-factor authentication
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'What is two-factor authentication (2FA) and why is it important?', 
   'multiple_choice',
   '["A backup password system", "An additional security layer requiring two forms of verification", "A way to share passwords securely", "A type of encryption"]'::jsonb,
   'An additional security layer requiring two forms of verification',
   '2FA combines "something you know" (password) with "something you have" (phone/token) or "something you are" (biometric). Even if passwords are compromised, attackers cannot access accounts without the second factor, reducing successful breaches by over 99% according to Microsoft studies.',
   2, 5);

  -- Question 6: Common cyber threats
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'Which of the following are common types of cyber threats? (Select all that apply)', 
   'multiple_correct',
   '["Malware", "Phishing", "Ransomware", "Social engineering", "Software updates", "Data backups"]'::jsonb,
   '["Malware", "Phishing", "Ransomware", "Social engineering"]',
   'These represent the most prevalent threat categories: Malware includes viruses and trojans that damage systems, Phishing tricks users into revealing credentials, Ransomware encrypts data for payment, and Social engineering manipulates people psychologically. Software updates and data backups are security measures, not threats.',
   4, 6);

  -- Question 7: What is malware
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'What is malware?', 
   'multiple_choice',
   '["Malicious software designed to harm or exploit systems", "Any software that requires updates", "Legitimate software with bugs", "Hardware that malfunctions"]'::jsonb,
   'Malicious software designed to harm or exploit systems',
   'Malware (malicious software) is any program designed to damage, disrupt, or gain unauthorized access to computer systems. Types include viruses, worms, trojans, spyware, and ransomware. Modern malware often combines multiple techniques and can evade traditional antivirus detection through sophisticated evasion methods.',
   2, 7);

  -- Question 8: How ransomware works
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'How do ransomware attacks typically work?', 
   'multiple_choice',
   '["Delete all files permanently", "Encrypt files and demand payment for decryption key", "Steal personal information only", "Slow down computer performance"]'::jsonb,
   'Encrypt files and demand payment for decryption key',
   'Ransomware encrypts victims'' files using strong encryption, making them inaccessible. Attackers then demand payment (usually cryptocurrency) for the decryption key. Even paying doesn''t guarantee file recovery, and it funds criminal operations. Prevention through backups and security measures is crucial since law enforcement advises against paying ransoms.',
   3, 8);

  -- Question 9: SME vulnerabilities
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'Why are small and medium enterprises (SMEs) particularly vulnerable to cyber attacks? (Select all that apply)', 
   'multiple_correct',
   '["Limited cybersecurity budgets", "Fewer security controls", "Less cybersecurity training", "They are too small to be targeted", "More valuable data than large enterprises"]'::jsonb,
   '["Limited cybersecurity budgets", "Fewer security controls", "Less cybersecurity training"]',
   'SMEs face unique challenges: Limited budgets restrict investment in advanced security tools, fewer dedicated IT staff means less specialized security expertise, and limited training budgets result in less cybersecurity awareness. This makes SMEs attractive targets for cybercriminals seeking easier victims. Contrary to belief, SMEs are frequently targeted precisely because of weaker defenses.',
   3, 9);

  -- Question 10: SME closure statistics
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'What percentage of small businesses that experience a major cyber attack go out of business within 6 months?', 
   'multiple_choice',
   '["25%", "40%", "60%", "85%"]'::jsonb,
   '60%',
   'According to cybersecurity studies, approximately 60% of small businesses close within 6 months of experiencing a major cyber attack. This devastating statistic reflects the severe financial impact, customer trust loss, regulatory penalties, and operational disruption that small businesses struggle to recover from without adequate resources and preparation.',
   2, 10);

  -- Question 11: Employees as first line of defense
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'Why are employees considered the first line of defense in cybersecurity?', 
   'multiple_choice',
   '["They are often the first to encounter threats and can prevent or report them", "They have the most technical knowledge", "They work directly with customers", "They are responsible for buying security software"]'::jsonb,
   'They are often the first to encounter threats and can prevent or report them',
   'Employees interact with emails, websites, and systems daily, making them the first to encounter many cyber threats. Well-trained employees can identify suspicious emails, avoid malicious websites, and report incidents quickly. Since 95% of successful attacks involve human error, employee awareness is critical for organizational security.',
   2, 11);

  -- Question 12: Handling suspicious emails
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'What should an employee do if they receive a suspicious email?', 
   'multiple_choice',
   '["Delete it immediately without telling anyone", "Forward it to colleagues to warn them", "Report it to IT security and delete it", "Click on links to verify if they are legitimate"]'::jsonb,
   'Report it to IT security and delete it',
   'Reporting suspicious emails helps IT security teams identify threats, update filters, and warn other employees. After reporting, delete the email to prevent accidental interaction. Never forward suspicious emails as this could spread the threat, and never click links or attachments to "verify" legitimacy as this could activate the threat.',
   2, 12);

  -- Question 13: Employee cybersecurity responsibilities
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module1_assessment_id, 
   'Which of the following are important cybersecurity responsibilities for all employees? (Select all that apply)', 
   'multiple_correct',
   '["Using strong passwords", "Keeping software updated", "Being cautious with email attachments", "Reporting security incidents", "Locking screens when away", "Configuring network firewalls"]'::jsonb,
   '["Using strong passwords", "Keeping software updated", "Being cautious with email attachments", "Reporting security incidents", "Locking screens when away"]',
   'Every employee shares cybersecurity responsibility: Strong passwords prevent unauthorized access, software updates patch security vulnerabilities, caution with attachments prevents malware, incident reporting enables quick response, and screen locking prevents physical access to systems. These basic practices significantly improve organizational security. Network firewall configuration is typically an IT specialist responsibility.',
   4, 13);

  -- =====================================================================
  -- COMPLETION AND VERIFICATION
  -- =====================================================================
  
  RAISE NOTICE 'Successfully created Module 1 Cybersecurity Fundamentals Quiz with explanations and options';
  RAISE NOTICE '- Total questions: %', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module1_assessment_id);
  RAISE NOTICE '- Assessment ID: %', module1_assessment_id;
  RAISE NOTICE '- Section ID: %', section_1_id;
  
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
WHERE a.title = 'Module 1: Cybersecurity Fundamentals Quiz'
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
WHERE a.title = 'Module 1: Cybersecurity Fundamentals Quiz'
ORDER BY aq.order_index;

COMMIT; 