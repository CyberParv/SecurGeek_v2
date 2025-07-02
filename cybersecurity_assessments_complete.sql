-- =====================================================================
-- COMPLETE CYBERSECURITY ASSESSMENT SYSTEM
-- =====================================================================
-- This script creates a comprehensive assessment system for the 
-- Introduction to Cybersecurity course including:
-- - Module quizzes for all 5 modules (70% passing, 3 attempts)
-- - Final comprehensive exam (30 questions, 75% passing, 3 attempts)
-- - Complete question bank with multiple choice, multiple select, and essay questions
-- =====================================================================

BEGIN;

-- Main execution block
DO $$
DECLARE
  course_uuid uuid;
  section_1_id uuid;  -- Module 1: Cybersecurity Fundamentals
  section_2_id uuid;  -- Module 2: Safe Internet Practices
  section_3_id uuid;  -- Module 3: Social Engineering & Phishing
  section_4_id uuid;  -- Module 4: Data Protection
  section_5_id uuid;  -- Module 5: Security Culture
  
  -- Assessment IDs
  module1_assessment_id uuid;
  module2_assessment_id uuid;
  module3_assessment_id uuid;
  module4_assessment_id uuid;
  module5_assessment_id uuid;
  final_assessment_id uuid;
  
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
  
  -- Get section IDs (flexible matching for different naming conventions)
  SELECT id INTO section_1_id FROM course_sections 
  WHERE course_id = course_uuid 
  AND (title ILIKE '%Module 1%' OR title ILIKE '%Introduction%' OR title ILIKE '%Fundamentals%')
  ORDER BY order_index LIMIT 1;
  
  SELECT id INTO section_2_id FROM course_sections 
  WHERE course_id = course_uuid 
  AND (title ILIKE '%Module 2%' OR title ILIKE '%Safe Internet%' OR title ILIKE '%Internet Practices%')
  ORDER BY order_index LIMIT 1;
  
  SELECT id INTO section_3_id FROM course_sections 
  WHERE course_id = course_uuid 
  AND (title ILIKE '%Module 3%' OR title ILIKE '%Social Engineering%' OR title ILIKE '%Phishing%')
  ORDER BY order_index LIMIT 1;
  
  SELECT id INTO section_4_id FROM course_sections 
  WHERE course_id = course_uuid 
  AND (title ILIKE '%Module 4%' OR title ILIKE '%Data Protection%' OR title ILIKE '%Privacy%')
  ORDER BY order_index LIMIT 1;
  
  SELECT id INTO section_5_id FROM course_sections 
  WHERE course_id = course_uuid 
  AND (title ILIKE '%Module 5%' OR title ILIKE '%Security Culture%' OR title ILIKE '%Culture%')
  ORDER BY order_index LIMIT 1;
  
  RAISE NOTICE 'Found course: % with sections: %, %, %, %, %', 
    course_uuid, section_1_id, section_2_id, section_3_id, section_4_id, section_5_id;
  
  -- =====================================================================
  -- MODULE 1: CYBERSECURITY FUNDAMENTALS QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_1_id,
    'Module 1: Cybersecurity Fundamentals Quiz',
    'Comprehensive assessment covering cybersecurity basics, password security, common threats, business impact, and employee responsibilities.',
    'quiz', 30, 3, 70, true, 1
  ) RETURNING id INTO module1_assessment_id;
  
  -- Module 1 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, correct_answer, points, order_index) VALUES
  (module1_assessment_id, 'What is the primary goal of cybersecurity?', 'multiple_choice', 'To protect digital assets, data, and systems from unauthorized access and threats', 2, 1),
  (module1_assessment_id, 'Which of the following are core principles of cybersecurity? (Select all that apply)', 'multiple_correct', 'Confidentiality,Integrity,Availability', 3, 2),
  (module1_assessment_id, 'What makes a password strong and secure? (Select all that apply)', 'multiple_correct', 'At least 12 characters long,Mix of uppercase and lowercase letters,Contains numbers and special characters,Unique for each account', 3, 3),
  (module1_assessment_id, 'Which of the following is the WORST password practice?', 'multiple_choice', 'Using the same password for multiple accounts', 2, 4),
  (module1_assessment_id, 'What is two-factor authentication (2FA) and why is it important?', 'multiple_choice', 'An additional security layer requiring two forms of verification', 2, 5),
  (module1_assessment_id, 'Which of the following are common types of cyber threats? (Select all that apply)', 'multiple_correct', 'Malware,Phishing,Ransomware,Social engineering', 4, 6),
  (module1_assessment_id, 'What is malware?', 'multiple_choice', 'Malicious software designed to harm or exploit systems', 2, 7),
  (module1_assessment_id, 'How do ransomware attacks typically work?', 'multiple_choice', 'Encrypt files and demand payment for decryption key', 3, 8),
  (module1_assessment_id, 'Why are small and medium enterprises (SMEs) particularly vulnerable to cyber attacks? (Select all that apply)', 'multiple_correct', 'Limited cybersecurity budgets,Fewer security controls,Less cybersecurity training', 3, 9),
  (module1_assessment_id, 'What percentage of small businesses that experience a major cyber attack go out of business within 6 months?', 'multiple_choice', '60%', 2, 10),
  (module1_assessment_id, 'Why are employees considered the first line of defense in cybersecurity?', 'multiple_choice', 'They are often the first to encounter threats and can prevent or report them', 2, 11),
  (module1_assessment_id, 'What should an employee do if they receive a suspicious email?', 'multiple_choice', 'Report it to IT security and delete it', 2, 12),
  (module1_assessment_id, 'Which of the following are important cybersecurity responsibilities for all employees? (Select all that apply)', 'multiple_correct', 'Using strong passwords,Keeping software updated,Being cautious with email attachments,Reporting security incidents,Locking screens when away', 4, 13);
  

  
  -- =====================================================================
  -- MODULE 2: SAFE INTERNET PRACTICES QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_2_id,
    'Module 2: Safe Internet Practices Quiz',
    'Assessment covering safe browsing, public Wi-Fi security, remote work best practices, and incident response procedures.',
    'quiz', 20, 3, 70, true, 2
  ) RETURNING id INTO module2_assessment_id;
  
  -- Module 2 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, correct_answer, points, order_index) VALUES
  (module2_assessment_id, 'What is the primary security risk when using public Wi-Fi networks?', 'multiple_choice', 'Man-in-the-middle attacks and data interception', 2, 1),
  (module2_assessment_id, 'Which of the following are essential practices for safe internet browsing? (Select all that apply)', 'multiple_correct', 'Verify website URLs,Use HTTPS connections,Keep browsers updated,Avoid suspicious downloads', 4, 2),
  (module2_assessment_id, 'When working remotely, what security measures should you implement? (Select all that apply)', 'multiple_correct', 'Use VPN connections,Secure home Wi-Fi,Lock devices when unattended,Use company-approved software', 4, 3),
  (module2_assessment_id, 'What should you do immediately upon discovering a potential security incident?', 'multiple_choice', 'Report it to IT security immediately', 3, 4),
  (module2_assessment_id, 'How can you verify if a website connection is secure?', 'multiple_choice', 'Look for HTTPS and padlock icon in browser', 2, 5),
  (module2_assessment_id, 'What is the purpose of automatic software updates?', 'multiple_choice', 'To patch security vulnerabilities and fix bugs', 2, 6);
  

  
  -- =====================================================================
  -- MODULE 3: SOCIAL ENGINEERING & PHISHING QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_3_id,
    'Module 3: Social Engineering & Phishing Defense Quiz',
    'Comprehensive assessment on identifying and defending against social engineering attacks, phishing, spear phishing, and business email compromise.',
    'quiz', 25, 3, 70, true, 3
  ) RETURNING id INTO module3_assessment_id;
  
  -- Module 3 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, correct_answer, points, order_index) VALUES
  (module3_assessment_id, 'What is the primary goal of social engineering attacks?', 'multiple_choice', 'To manipulate people into revealing information or performing actions', 2, 1),
  (module3_assessment_id, 'Which of the following are common social engineering techniques? (Select all that apply)', 'multiple_correct', 'Phishing emails,Pretexting,Baiting,Tailgating', 4, 2),
  (module3_assessment_id, 'How does spear phishing differ from regular phishing?', 'multiple_choice', 'Spear phishing targets specific individuals with personalized attacks', 3, 3),
  (module3_assessment_id, 'What characterizes a Business Email Compromise (BEC) attack?', 'multiple_choice', 'Impersonating executives to request fraudulent transactions', 3, 4),
  (module3_assessment_id, 'If you accidentally click a malicious link, what should you do first?', 'multiple_choice', 'Disconnect from the internet and report to IT immediately', 3, 5),
  (module3_assessment_id, 'Which of these are red flags in a potential phishing email? (Select all that apply)', 'multiple_correct', 'Urgent language,Generic greetings,Suspicious links,Requests for sensitive information', 4, 6),
  (module3_assessment_id, 'What is "vishing"?', 'multiple_choice', 'Voice phishing conducted over phone calls', 2, 7);
  

  
  -- =====================================================================
  -- MODULE 4: DATA PROTECTION QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_4_id,
    'Module 4: Data Protection & Privacy Quiz',
    'Assessment covering data classification, privacy regulations, secure data handling, breach response, and mobile device security.',
    'quiz', 20, 3, 70, true, 4
  ) RETURNING id INTO module4_assessment_id;
  
  -- Module 4 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, correct_answer, points, order_index) VALUES
  (module4_assessment_id, 'Which types of data are considered "sensitive" and require special protection? (Select all that apply)', 'multiple_correct', 'Personal identification information,Financial data,Health records,Confidential business information', 4, 1),
  (module4_assessment_id, 'What is the most important principle when handling customer personal data?', 'multiple_choice', 'Only collect and use data for legitimate business purposes', 2, 2),
  (module4_assessment_id, 'Under GDPR, what rights do individuals have regarding their personal data? (Select all that apply)', 'multiple_correct', 'Right to access,Right to rectification,Right to erasure,Right to data portability', 4, 3),
  (module4_assessment_id, 'What constitutes a data breach that must be reported?', 'multiple_choice', 'Any unauthorized access to or loss of personal data', 3, 4),
  (module4_assessment_id, 'Which mobile device security practices are essential? (Select all that apply)', 'multiple_correct', 'Use screen locks,Keep OS updated,Install apps only from official stores,Enable remote wipe capability', 4, 5),
  (module4_assessment_id, 'How should you securely dispose of devices containing sensitive data?', 'multiple_choice', 'Use professional data destruction services or secure wiping tools', 3, 6);
  

  
  -- =====================================================================
  -- MODULE 5: SECURITY CULTURE QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_5_id,
    'Module 5: Building Security Culture Quiz',
    'Final module assessment on developing security awareness, continuous learning, shared responsibility, and creating a security-first organizational culture.',
    'quiz', 20, 3, 70, true, 5
  ) RETURNING id INTO module5_assessment_id;
  
  -- Module 5 Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, correct_answer, points, order_index) VALUES
  (module5_assessment_id, 'What does it mean to have a "security-first mindset"?', 'multiple_choice', 'Considering security implications in all decisions and actions', 3, 1),
  (module5_assessment_id, 'How can employees contribute to building a strong security culture? (Select all that apply)', 'multiple_correct', 'Follow security policies,Report suspicious activities,Participate in training,Share security knowledge', 4, 2),
  (module5_assessment_id, 'Why is continuous cybersecurity learning important for all employees?', 'multiple_choice', 'Threats constantly evolve and new attack methods emerge regularly', 2, 3),
  (module5_assessment_id, 'What is the "shared responsibility model" in cybersecurity?', 'multiple_choice', 'Everyone in the organization has a role in maintaining security', 3, 4),
  (module5_assessment_id, 'Which behaviors demonstrate good security awareness? (Select all that apply)', 'multiple_correct', 'Questioning unexpected requests,Verifying sender identity,Keeping software updated,Using strong authentication', 4, 5);
  

  
  -- =====================================================================
  -- FINAL COMPREHENSIVE CERTIFICATION EXAM
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, NULL,
    'Final Cybersecurity Certification Exam',
    'Comprehensive 30-question assessment covering all cybersecurity fundamentals: basic concepts, safe practices, social engineering, data protection, and security culture. Must achieve 75% to pass. 60 minutes time limit with only 3 attempts allowed.',
    'final', 60, 3, 75, true, 99
  ) RETURNING id INTO final_assessment_id;
  
  -- Final Exam Questions (30 comprehensive questions)
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, correct_answer, points, order_index) VALUES
  -- Fundamentals (Questions 1-8)
  (final_assessment_id, 'The CIA triad in cybersecurity refers to which three core principles?', 'multiple_choice', 'Confidentiality, Integrity, Availability', 2, 1),
  (final_assessment_id, 'Which password would be considered the MOST secure?', 'multiple_choice', 'correct-horse-battery-staple-2024!', 2, 2),
  (final_assessment_id, 'What is the primary difference between a virus and a worm?', 'multiple_choice', 'Viruses need host files to spread, worms can spread independently', 3, 3),
  (final_assessment_id, 'According to industry statistics, approximately what percentage of small businesses close within 6 months of experiencing a major cyber attack?', 'multiple_choice', '60%', 2, 4),
  (final_assessment_id, 'Which of the following are considered essential employee cybersecurity responsibilities? (Select all that apply)', 'multiple_correct', 'Using strong passwords,Reporting suspicious activities,Keeping software updated,Locking workstations', 4, 5),
  (final_assessment_id, 'What makes small and medium enterprises (SMEs) particularly attractive targets for cybercriminals? (Select all that apply)', 'multiple_correct', 'Limited cybersecurity budgets,Weaker security controls,Less cybersecurity awareness', 3, 6),
  (final_assessment_id, 'Two-factor authentication (2FA) provides security by requiring:', 'multiple_choice', 'Something you know and something you have', 2, 7),
  (final_assessment_id, 'Which of these represents the GREATEST cybersecurity risk for most organizations?', 'multiple_choice', 'Human error and social engineering', 3, 8),
  
  -- Safe Internet Practices (Questions 9-14)
  (final_assessment_id, 'When connecting to public Wi-Fi, which practice provides the BEST security?', 'multiple_choice', 'Using a VPN (Virtual Private Network)', 2, 9),
  (final_assessment_id, 'What are the key indicators of a phishing email? (Select all that apply)', 'multiple_correct', 'Urgent language,Generic greetings,Suspicious links,Requests for sensitive information', 4, 10),
  (final_assessment_id, 'Which of the following are essential for secure remote work? (Select all that apply)', 'multiple_correct', 'Use VPN connections,Secure home Wi-Fi,Keep devices updated,Use company-approved software', 4, 11),
  (final_assessment_id, 'What should you do immediately after discovering a potential security incident?', 'multiple_choice', 'Report it to IT security immediately', 3, 12),
  (final_assessment_id, 'When is it safe to download software from the internet?', 'multiple_choice', 'Only from official vendor websites or trusted app stores', 2, 13),
  (final_assessment_id, 'What is the primary purpose of keeping software updated?', 'multiple_choice', 'To patch security vulnerabilities and fix bugs', 2, 14),
  
  -- Social Engineering (Questions 15-20)
  (final_assessment_id, 'Social engineering attacks primarily exploit:', 'multiple_choice', 'Human psychology and trust', 2, 15),
  (final_assessment_id, 'What distinguishes spear phishing from regular phishing attacks?', 'multiple_choice', 'Spear phishing targets specific individuals with personalized attacks', 3, 16),
  (final_assessment_id, 'CEO fraud (Business Email Compromise) typically involves:', 'multiple_choice', 'Impersonating executives to request fraudulent transactions', 3, 17),
  (final_assessment_id, 'If you accidentally click on a malicious link or download suspicious content, what should you do first?', 'multiple_choice', 'Disconnect from the internet and report to IT immediately', 3, 18),
  (final_assessment_id, 'Which of the following are common social engineering tactics? (Select all that apply)', 'multiple_correct', 'Creating false urgency,Impersonating authority figures,Exploiting helpfulness,Using fear or intimidation', 4, 19),
  (final_assessment_id, 'In a vishing attack, criminals use:', 'multiple_choice', 'Voice calls to trick victims into revealing information', 2, 20),
  
  -- Data Protection (Questions 21-26)
  (final_assessment_id, 'Which types of information are considered sensitive data that require special protection? (Select all that apply)', 'multiple_correct', 'Personal identification information,Financial data,Health records,Confidential business information', 4, 21),
  (final_assessment_id, 'What is the most important principle when handling sensitive customer data?', 'multiple_choice', 'Only collect and use data for legitimate business purposes', 2, 22),
  (final_assessment_id, 'Under GDPR and similar privacy laws, what rights do individuals have regarding their personal data? (Select all that apply)', 'multiple_correct', 'Right to access,Right to rectification,Right to erasure,Right to data portability', 4, 23),
  (final_assessment_id, 'What constitutes a data breach?', 'multiple_choice', 'Any unauthorized access to or loss of personal data', 3, 24),
  (final_assessment_id, 'Which practice is MOST important for protecting data on mobile devices?', 'multiple_choice', 'Using strong device authentication and encryption', 2, 25),
  (final_assessment_id, 'When disposing of old computers or storage devices, what is the most secure approach?', 'multiple_choice', 'Use professional data destruction services or secure wiping tools', 3, 26),
  
  -- Security Culture (Questions 27-30)
  (final_assessment_id, 'What does it mean to have a "security-first mindset"?', 'multiple_choice', 'Considering security implications in all decisions and actions', 3, 27),
  (final_assessment_id, 'How can employees contribute to building a strong security culture? (Select all that apply)', 'multiple_correct', 'Follow security policies,Report suspicious activities,Participate in training,Share security knowledge', 4, 28),
  (final_assessment_id, 'Why is continuous cybersecurity learning important for all employees?', 'multiple_choice', 'Threats constantly evolve and new attack methods emerge regularly', 2, 29),
  (final_assessment_id, 'Which statement best describes the shared responsibility model in cybersecurity?', 'multiple_choice', 'Everyone in the organization has a role in maintaining security', 3, 30);
  

  
  -- =====================================================================
  -- COMPLETION AND VERIFICATION
  -- =====================================================================
  
  RAISE NOTICE 'Successfully created comprehensive cybersecurity assessment system:';
  RAISE NOTICE '- Module 1 Quiz: % questions', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module1_assessment_id);
  RAISE NOTICE '- Module 2 Quiz: % questions', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module2_assessment_id);
  RAISE NOTICE '- Module 3 Quiz: % questions', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module3_assessment_id);
  RAISE NOTICE '- Module 4 Quiz: % questions', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module4_assessment_id);
  RAISE NOTICE '- Module 5 Quiz: % questions', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module5_assessment_id);
  RAISE NOTICE '- Final Exam: % questions', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = final_assessment_id);
  
END $$;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Summary of all assessments created
SELECT 
  a.title as assessment_title,
  a.assessment_type,
  COUNT(aq.id) as question_count,
  a.time_limit_minutes,
  a.max_attempts,
  a.passing_score,
  a.order_index
FROM assessments a
LEFT JOIN assessment_questions aq ON a.id = aq.assessment_id
WHERE a.course_id = (SELECT id FROM courses WHERE title = 'Introduction to Cybersecurity' LIMIT 1)
GROUP BY a.id, a.title, a.assessment_type, a.time_limit_minutes, a.max_attempts, a.passing_score, a.order_index
ORDER BY a.order_index;

-- Total question count
SELECT 
  'Total Questions Created' as summary,
  COUNT(*) as total_questions
FROM assessment_questions aq
JOIN assessments a ON aq.assessment_id = a.id
WHERE a.course_id = (SELECT id FROM courses WHERE title = 'Introduction to Cybersecurity' LIMIT 1);

COMMIT;