-- Module 1 Quiz Questions for Introduction to Cybersecurity Course
-- This script creates comprehensive quizzes for each lesson in Module 1

BEGIN;

-- Get the course ID and lesson IDs for Module 1
DO $$
DECLARE
  course_uuid uuid;
  lesson_1_1_id uuid; -- Introduction to Cybersecurity
  lesson_1_2_id uuid; -- Creating and Managing Secure Passwords
  lesson_1_3_id uuid; -- Common Cyber Threats Explained
  lesson_1_4_id uuid; -- Impact of Cyber Attacks on SMEs
  lesson_1_5_id uuid; -- Employees as the First Line of Defense
  section_1_id uuid;  -- Module 1 section
  assessment_id uuid; -- Assessment ID variable
  
BEGIN
  -- Get course ID
  SELECT id INTO course_uuid 
  FROM courses 
  WHERE title = 'Introduction to Cybersecurity' 
  LIMIT 1;
  
  IF course_uuid IS NULL THEN
    RAISE EXCEPTION 'Course not found. Please ensure the cybersecurity course exists.';
  END IF;
  
  -- Get Module 1 section ID
  SELECT id INTO section_1_id 
  FROM course_sections 
  WHERE course_id = course_uuid 
  AND title LIKE '%Module 1%' OR title LIKE '%Introduction%'
  ORDER BY order_index 
  LIMIT 1;
  
  -- Get lesson IDs for Module 1
  SELECT id INTO lesson_1_1_id FROM lessons WHERE course_id = course_uuid AND title LIKE '%Introduction to Cybersecurity%' LIMIT 1;
  SELECT id INTO lesson_1_2_id FROM lessons WHERE course_id = course_uuid AND title LIKE '%Password%' LIMIT 1;
  SELECT id INTO lesson_1_3_id FROM lessons WHERE course_id = course_uuid AND title LIKE '%Common Cyber Threats%' LIMIT 1;
  SELECT id INTO lesson_1_4_id FROM lessons WHERE course_id = course_uuid AND title LIKE '%Impact%SME%' LIMIT 1;
  SELECT id INTO lesson_1_5_id FROM lessons WHERE course_id = course_uuid AND title LIKE '%Employees%First Line%' LIMIT 1;
  
  -- Create Module 1 Section Quiz (End of Module Assessment)
  INSERT INTO assessments (
    course_id,
    section_id,
    title,
    description,
    type,
    time_limit,
    max_attempts,
    passing_score,
    is_required,
    order_index
  ) VALUES (
    course_uuid,
    section_1_id,
    'Module 1: Cybersecurity Fundamentals Quiz',
    'Comprehensive assessment covering cybersecurity basics, password security, common threats, business impact, and employee responsibilities.',
    'quiz',
    1800, -- 30 minutes
    3,    -- 3 attempts allowed
    70,   -- 70% passing score
    true,
    1
  );
  
  -- Get the assessment ID
  SELECT id INTO assessment_id FROM assessments WHERE title = 'Module 1: Cybersecurity Fundamentals Quiz' AND course_id = course_uuid;
  
  -- LESSON 1.1: Introduction to Cybersecurity Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (assessment_id, 'What is the primary goal of cybersecurity?', 'multiple_choice', 2, 1),
  (assessment_id, 'Which of the following are core principles of cybersecurity? (Select all that apply)', 'multiple_select', 3, 2),
  (assessment_id, 'Define cybersecurity in your own words and explain why it matters in today''s digital world.', 'essay', 5, 3);
  
  -- Add answer options for Question 1
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of cybersecurity%' AND assessment_id = assessment_id), 'To make systems completely unhackable', false, 'No system can be made completely unhackable.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of cybersecurity%' AND assessment_id = assessment_id), 'To protect digital assets, data, and systems from unauthorized access and threats', true, 'Correct! Cybersecurity aims to protect confidentiality, integrity, and availability of information.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of cybersecurity%' AND assessment_id = assessment_id), 'To prevent all computer viruses', false, 'This is too narrow - cybersecurity covers much more than just viruses.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%primary goal of cybersecurity%' AND assessment_id = assessment_id), 'To monitor employee internet usage', false, 'Monitoring is just one small aspect, not the primary goal.');
  
  -- Add answer options for Question 2 (Multiple Select)
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%core principles of cybersecurity%' AND assessment_id = assessment_id), 'Confidentiality', true, 'Correct! Ensuring information is only accessible to authorized individuals.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%core principles of cybersecurity%' AND assessment_id = assessment_id), 'Integrity', true, 'Correct! Maintaining accuracy and completeness of data.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%core principles of cybersecurity%' AND assessment_id = assessment_id), 'Availability', true, 'Correct! Ensuring systems and data are accessible when needed.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%core principles of cybersecurity%' AND assessment_id = assessment_id), 'Profitability', false, 'This is a business goal, not a cybersecurity principle.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%core principles of cybersecurity%' AND assessment_id = assessment_id), 'Complexity', false, 'Complexity is not a core cybersecurity principle.');
  
  -- LESSON 1.2: Password Security Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (assessment_id, 'What makes a password strong and secure?', 'multiple_select', 3, 4),
  (assessment_id, 'Which of the following is the WORST password practice?', 'multiple_choice', 2, 5),
  (assessment_id, 'What is two-factor authentication (2FA) and why is it important?', 'multiple_choice', 2, 6);
  
  -- Password strength question options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%makes a password strong%' AND assessment_id = assessment_id), 'At least 12 characters long', true, 'Correct! Length is crucial for password strength.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%makes a password strong%' AND assessment_id = assessment_id), 'Mix of uppercase and lowercase letters', true, 'Correct! Character variety increases security.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%makes a password strong%' AND assessment_id = assessment_id), 'Contains numbers and special characters', true, 'Correct! Complexity makes passwords harder to crack.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%makes a password strong%' AND assessment_id = assessment_id), 'Easy to remember personal information', false, 'Personal information makes passwords predictable and weak.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%makes a password strong%' AND assessment_id = assessment_id), 'Unique for each account', true, 'Correct! Reusing passwords increases risk if one is compromised.');
  
  -- Worst password practice options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%WORST password practice%' AND assessment_id = assessment_id), 'Using the same password for multiple accounts', true, 'Correct! This is extremely dangerous as one breach compromises all accounts.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%WORST password practice%' AND assessment_id = assessment_id), 'Writing passwords down in a secure location', false, 'This can actually be acceptable if done securely.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%WORST password practice%' AND assessment_id = assessment_id), 'Using a password manager', false, 'This is actually a best practice.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%WORST password practice%' AND assessment_id = assessment_id), 'Changing passwords periodically', false, 'This is generally good practice, though not as critical as once thought.');
  
  -- 2FA question options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%two-factor authentication%' AND assessment_id = assessment_id), 'A backup password system', false, '2FA is not about backup passwords.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%two-factor authentication%' AND assessment_id = assessment_id), 'An additional security layer requiring two forms of verification', true, 'Correct! 2FA requires something you know (password) plus something you have (phone/token).'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%two-factor authentication%' AND assessment_id = assessment_id), 'A way to share passwords securely', false, '2FA is not about password sharing.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%two-factor authentication%' AND assessment_id = assessment_id), 'A type of encryption', false, '2FA is an authentication method, not encryption.');
  
  -- LESSON 1.3: Common Cyber Threats Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (assessment_id, 'Which of the following are common types of cyber threats? (Select all that apply)', 'multiple_select', 4, 7),
  (assessment_id, 'What is malware?', 'multiple_choice', 2, 8),
  (assessment_id, 'How do ransomware attacks typically work?', 'multiple_choice', 3, 9);
  
  -- Common threats options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%common types of cyber threats%' AND assessment_id = assessment_id), 'Phishing emails', true, 'Correct! Phishing is one of the most common attack vectors.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%common types of cyber threats%' AND assessment_id = assessment_id), 'Malware', true, 'Correct! Malicious software is a major threat category.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%common types of cyber threats%' AND assessment_id = assessment_id), 'Social engineering', true, 'Correct! Manipulating people to divulge information is common.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%common types of cyber threats%' AND assessment_id = assessment_id), 'Software updates', false, 'Updates are security measures, not threats.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%common types of cyber threats%' AND assessment_id = assessment_id), 'DDoS attacks', true, 'Correct! Distributed Denial of Service attacks are common threats.');
  
  -- Malware definition options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%What is malware%' AND assessment_id = assessment_id), 'Malicious software designed to harm or exploit systems', true, 'Correct! Malware includes viruses, trojans, spyware, and other harmful programs.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%What is malware%' AND assessment_id = assessment_id), 'A type of firewall', false, 'Firewalls are security tools, not malware.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%What is malware%' AND assessment_id = assessment_id), 'Legitimate software with bugs', false, 'Bugs are unintentional; malware is deliberately malicious.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%What is malware%' AND assessment_id = assessment_id), 'Any software that costs money', false, 'Cost has nothing to do with whether software is malicious.');
  
  -- Ransomware options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%ransomware attacks typically work%' AND assessment_id = assessment_id), 'They encrypt files and demand payment for decryption', true, 'Correct! Ransomware locks access to data until a ransom is paid.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%ransomware attacks typically work%' AND assessment_id = assessment_id), 'They steal passwords and sell them', false, 'This describes credential theft, not ransomware.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%ransomware attacks typically work%' AND assessment_id = assessment_id), 'They slow down computer performance', false, 'Performance issues are not the primary goal of ransomware.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%ransomware attacks typically work%' AND assessment_id = assessment_id), 'They display unwanted advertisements', false, 'This describes adware, not ransomware.');
  
  -- LESSON 1.4: Impact on SMEs Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (assessment_id, 'Why are small and medium enterprises (SMEs) particularly vulnerable to cyber attacks?', 'multiple_select', 3, 10),
  (assessment_id, 'What can be the consequences of a cyber attack on a small business?', 'multiple_select', 4, 11),
  (assessment_id, 'What percentage of small businesses that experience a major cyber attack go out of business within 6 months?', 'multiple_choice', 2, 12);
  
  -- SME vulnerability options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%SMEs particularly vulnerable%' AND assessment_id = assessment_id), 'Limited cybersecurity budgets', true, 'Correct! SMEs often cannot afford comprehensive security solutions.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%SMEs particularly vulnerable%' AND assessment_id = assessment_id), 'Lack of dedicated IT security staff', true, 'Correct! Many SMEs don''t have specialized security personnel.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%SMEs particularly vulnerable%' AND assessment_id = assessment_id), 'Outdated systems and software', true, 'Correct! SMEs may delay updates due to cost or operational concerns.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%SMEs particularly vulnerable%' AND assessment_id = assessment_id), 'They are too small to be targeted', false, 'SMEs are actually frequent targets due to weaker defenses.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%SMEs particularly vulnerable%' AND assessment_id = assessment_id), 'Less awareness of cybersecurity threats', true, 'Correct! Limited resources for security training and awareness.');
  
  -- Consequences options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%consequences of a cyber attack%' AND assessment_id = assessment_id), 'Financial losses from theft or ransom', true, 'Correct! Direct financial impact is common.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%consequences of a cyber attack%' AND assessment_id = assessment_id), 'Loss of customer trust and reputation damage', true, 'Correct! Reputation damage can be long-lasting.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%consequences of a cyber attack%' AND assessment_id = assessment_id), 'Operational disruption and downtime', true, 'Correct! Attacks can halt business operations.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%consequences of a cyber attack%' AND assessment_id = assessment_id), 'Legal and regulatory penalties', true, 'Correct! Data breaches can result in fines and legal action.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%consequences of a cyber attack%' AND assessment_id = assessment_id), 'Improved security awareness', false, 'While this might be a silver lining, it''s not a negative consequence.');
  
  -- Business closure statistics options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%percentage of small businesses%go out of business%' AND assessment_id = assessment_id), '10%', false, 'Too low - the impact is much more severe.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%percentage of small businesses%go out of business%' AND assessment_id = assessment_id), '25%', false, 'Still too low for this critical statistic.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%percentage of small businesses%go out of business%' AND assessment_id = assessment_id), '60%', true, 'Correct! Studies show approximately 60% of small businesses close within 6 months of a major cyber attack.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%percentage of small businesses%go out of business%' AND assessment_id = assessment_id), '90%', false, 'Too high, though the actual number is still alarmingly high.');
  
  -- LESSON 1.5: Employees as First Line of Defense Questions
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, points, order_index) VALUES
  (assessment_id, 'Why are employees considered the first line of defense in cybersecurity?', 'multiple_choice', 2, 13),
  (assessment_id, 'What should an employee do if they receive a suspicious email?', 'multiple_choice', 2, 14),
  (assessment_id, 'Which of the following are important cybersecurity responsibilities for all employees? (Select all that apply)', 'multiple_select', 4, 15),
  (assessment_id, 'Describe three specific actions you would take as an employee to help protect your organization from cyber threats.', 'essay', 6, 16);
  
  -- First line of defense options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%employees considered the first line%' AND assessment_id = assessment_id), 'They are the most likely to encounter and recognize threats', true, 'Correct! Employees interact with emails, links, and systems daily, making them the first to spot threats.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%employees considered the first line%' AND assessment_id = assessment_id), 'They have the most technical knowledge', false, 'Technical knowledge varies; it''s about position, not expertise.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%employees considered the first line%' AND assessment_id = assessment_id), 'They work directly with customers', false, 'Customer interaction is not what makes them the first line of defense.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%employees considered the first line%' AND assessment_id = assessment_id), 'They are responsible for buying security software', false, 'Procurement is typically not an employee''s role.');
  
  -- Suspicious email options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%suspicious email%' AND assessment_id = assessment_id), 'Delete it immediately without telling anyone', false, 'Deleting helps you, but reporting helps protect others.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%suspicious email%' AND assessment_id = assessment_id), 'Forward it to colleagues to warn them', false, 'Forwarding could spread the threat further.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%suspicious email%' AND assessment_id = assessment_id), 'Report it to IT security and delete it', true, 'Correct! Report first to help protect the organization, then delete.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%suspicious email%' AND assessment_id = assessment_id), 'Click on links to verify if they are legitimate', false, 'Never click suspicious links - this could activate the threat.');
  
  -- Employee responsibilities options
  INSERT INTO question_options (question_id, option_text, is_correct, explanation) VALUES
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%cybersecurity responsibilities for all employees%' AND assessment_id = assessment_id), 'Using strong, unique passwords', true, 'Correct! Password security is everyone''s responsibility.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%cybersecurity responsibilities for all employees%' AND assessment_id = assessment_id), 'Keeping software updated', true, 'Correct! Updates often include security patches.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%cybersecurity responsibilities for all employees%' AND assessment_id = assessment_id), 'Being cautious with email attachments and links', true, 'Correct! Email is a common attack vector.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%cybersecurity responsibilities for all employees%' AND assessment_id = assessment_id), 'Configuring firewalls and servers', false, 'This is typically an IT specialist''s responsibility.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%cybersecurity responsibilities for all employees%' AND assessment_id = assessment_id), 'Reporting security incidents promptly', true, 'Correct! Quick reporting can prevent or minimize damage.'),
  ((SELECT id FROM assessment_questions WHERE question_text LIKE '%cybersecurity responsibilities for all employees%' AND assessment_id = assessment_id), 'Locking screens when away from desk', true, 'Correct! Physical security is part of cybersecurity.');
  
  RAISE NOTICE 'Successfully created Module 1 quiz with % questions', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = assessment_id);
  
END $$;

-- Verify the quiz was created
SELECT 
  a.title as assessment_title,
  COUNT(aq.id) as question_count,
  a.time_limit/60 as time_limit_minutes,
  a.max_attempts,
  a.passing_score
FROM assessments a
LEFT JOIN assessment_questions aq ON a.id = aq.assessment_id
WHERE a.title = 'Module 1: Cybersecurity Fundamentals Quiz'
GROUP BY a.id, a.title, a.time_limit, a.max_attempts, a.passing_score;

COMMIT;