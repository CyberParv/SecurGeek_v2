-- =====================================================================
-- MODULE 2: SAFE INTERNET USAGE AND BEST PRACTICES QUIZ WITH EXPLANATIONS
-- =====================================================================
-- Complete Module 2 assessment covering safe internet usage, phishing recognition,
-- device security, Wi-Fi safety, remote work practices, and incident reporting.
-- Includes detailed explanations for all questions and answer options.
-- =====================================================================

BEGIN;

-- Main execution block
DO $$
DECLARE
  course_uuid uuid;
  section_2_id uuid;  -- Module 2: Safe Internet Usage and Best Practices
  module2_assessment_id uuid;
  
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
  
  -- Debug: Show all available sections
  RAISE NOTICE 'Available course sections:';
  FOR section_2_id IN 
    SELECT id FROM course_sections WHERE course_id = course_uuid ORDER BY order_index
  LOOP
    RAISE NOTICE '- Section ID: %, Title: %', 
      section_2_id,
      (SELECT title FROM course_sections WHERE id = section_2_id);
  END LOOP;
  
  -- Find Module 2 section with multiple matching strategies
  -- Strategy 1: Look for "Module 2" specifically
  SELECT id INTO section_2_id 
  FROM course_sections 
  WHERE course_id = course_uuid 
    AND title ILIKE '%module 2%'
  LIMIT 1;
  
  -- Strategy 2: Look for "Safe Internet" or related terms
  IF section_2_id IS NULL THEN
    SELECT id INTO section_2_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
      AND (title ILIKE '%safe internet%' 
           OR title ILIKE '%internet usage%'
           OR title ILIKE '%best practices%'
           OR title ILIKE '%safe practices%')
    LIMIT 1;
  END IF;
  
  -- Strategy 3: Use second section by order
  IF section_2_id IS NULL THEN
    SELECT id INTO section_2_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
    ORDER BY order_index 
    OFFSET 1 LIMIT 1;
  END IF;
  
  -- Approach 4: Create assessment without section if no sections exist
  IF section_2_id IS NULL THEN
    RAISE NOTICE 'No Module 2 section found. Creating course-level assessment.';
    -- We'll set section_2_id to NULL for course-level assessment
  ELSE
    RAISE NOTICE 'Using section: % (%)', 
      section_2_id, 
      (SELECT title FROM course_sections WHERE id = section_2_id);
  END IF;
  
  -- =====================================================================
  -- MODULE 2: SAFE INTERNET USAGE AND BEST PRACTICES QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_2_id,  -- This can be NULL for course-level assessment
    'Module 2: Safe Internet Usage and Best Practices Quiz',
    'Assessment covering safe internet browsing, phishing recognition, device security, Wi-Fi safety, remote work practices, and incident reporting procedures.',
    'quiz', 20, 3, 70, true, 2
  ) RETURNING id INTO module2_assessment_id;
  
  -- =====================================================================
  -- MODULE 2 QUESTIONS WITH DETAILED EXPLANATIONS AND OPTIONS
  -- =====================================================================
  
  -- Question 1: Safe browsing practices
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'Which of the following are safe browsing practices? (Select all that apply)', 
   'multiple_correct',
   '["Verify website URLs before entering sensitive information", "Look for HTTPS and padlock icons", "Keep browsers updated with latest security patches", "Click on pop-up ads to close them", "Download software from official sources only", "Use the same password for all websites"]'::jsonb,
   '["Verify website URLs before entering sensitive information", "Look for HTTPS and padlock icons", "Keep browsers updated with latest security patches", "Download software from official sources only"]',
   'Safe browsing requires multiple precautions: URL verification prevents typosquatting attacks, HTTPS ensures encrypted communication, browser updates patch security vulnerabilities, and official software sources prevent malware. Never click pop-ups (use browser close button) and always use unique passwords for different sites.',
   4, 1);

  -- Question 2: Identifying legitimate websites
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'How can you identify if a website is legitimate and safe?', 
   'multiple_choice',
   '["It has colorful graphics and animations", "It displays HTTPS in the URL and has a valid security certificate", "It asks for personal information immediately", "It has many pop-up advertisements"]'::jsonb,
   'It displays HTTPS in the URL and has a valid security certificate',
   'Legitimate websites use HTTPS encryption (indicated by the padlock icon) and have valid SSL certificates that can be verified by clicking the padlock. Graphics quality, immediate requests for personal information, and pop-ups are not reliable security indicators and may actually suggest malicious intent.',
   2, 2);

  -- Question 3: Phishing email characteristics
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'Which of the following are common characteristics of phishing emails? (Select all that apply)', 
   'multiple_correct',
   '["Urgent language creating time pressure", "Generic greetings like Dear Customer", "Suspicious sender addresses", "Requests for sensitive information", "Perfect grammar and spelling", "Official company logos"]'::jsonb,
   '["Urgent language creating time pressure", "Generic greetings like Dear Customer", "Suspicious sender addresses", "Requests for sensitive information"]',
   'Phishing emails use psychological manipulation: urgency creates panic decisions, generic greetings indicate mass distribution, suspicious sender addresses reveal impersonation attempts, and requests for sensitive information are major red flags. Attackers often copy logos and may have good grammar, so these alone aren''t reliable indicators.',
   4, 3);

  -- Question 4: Suspicious email response
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'What should you do if you receive a suspicious email claiming to be from your bank?', 
   'multiple_choice',
   '["Click the link to verify your account immediately", "Reply to the email asking for verification", "Contact your bank directly using official contact information", "Forward the email to all your contacts"]'::jsonb,
   'Contact your bank directly using official contact information',
   'Always verify suspicious communications through official channels. Banks never request sensitive information via email. Contact them using phone numbers or websites you know are legitimate, not information provided in the suspicious email. This prevents falling for phishing attempts that impersonate trusted institutions.',
   3, 4);

  -- Question 5: Device security best practices
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'Which device security practices help protect against cyber threats? (Select all that apply)', 
   'multiple_correct',
   '["Enable automatic screen locks with passwords/PINs", "Install security updates promptly", "Use reputable antivirus software", "Disable automatic software updates", "Connect to any available Wi-Fi network", "Enable remote wipe capabilities for mobile devices"]'::jsonb,
   '["Enable automatic screen locks with passwords/PINs", "Install security updates promptly", "Use reputable antivirus software", "Enable remote wipe capabilities for mobile devices"]',
   'Comprehensive device security includes: screen locks prevent unauthorized physical access, security updates patch vulnerabilities, antivirus software detects malware, and remote wipe protects data if devices are lost/stolen. Never disable automatic updates or connect to unsecured Wi-Fi networks as these create security vulnerabilities.',
   4, 5);

  -- Question 6: Public Wi-Fi safety
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'What is the safest approach when using public Wi-Fi networks?', 
   'multiple_choice',
   '["Use public Wi-Fi freely for all activities", "Only access non-sensitive websites and avoid financial transactions", "Always use a VPN when connecting to public Wi-Fi", "Share the Wi-Fi password with other users"]'::jsonb,
   'Always use a VPN when connecting to public Wi-Fi',
   'VPNs (Virtual Private Networks) encrypt all internet traffic, protecting data even on unsecured public Wi-Fi. Public networks are easily monitored by attackers, making all activities potentially visible. While avoiding sensitive activities helps, a VPN provides comprehensive protection for all internet usage on public networks.',
   3, 6);

  -- Question 7: Remote work security
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'Which practices enhance security when working remotely? (Select all that apply)', 
   'multiple_correct',
   '["Use company-approved cloud storage services", "Secure physical workspace from unauthorized viewing", "Use personal email for work communications", "Enable multi-factor authentication on all work accounts", "Work from public spaces with open Wi-Fi", "Keep work devices updated and encrypted"]'::jsonb,
   '["Use company-approved cloud storage services", "Secure physical workspace from unauthorized viewing", "Enable multi-factor authentication on all work accounts", "Keep work devices updated and encrypted"]',
   'Remote work security requires multiple layers: approved cloud services ensure data protection compliance, physical security prevents shoulder surfing and unauthorized access, MFA adds authentication security, and device encryption protects data if hardware is compromised. Never use personal email for work or unsecured public networks.',
   4, 7);

  -- Question 8: Software download safety
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'What is the safest way to download and install software?', 
   'multiple_choice',
   '["Download from any website offering the software", "Use peer-to-peer file sharing networks", "Download only from official websites or verified app stores", "Install software from email attachments"]'::jsonb,
   'Download only from official websites or verified app stores',
   'Official sources verify software authenticity and scan for malware. Third-party sites, P2P networks, and email attachments are common malware distribution methods. App stores and official websites have security measures, digital signatures, and reputation systems that significantly reduce malware risk.',
   2, 8);

  -- Question 9: Social media privacy
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'How can you protect your privacy on social media platforms? (Select all that apply)', 
   'multiple_correct',
   '["Review and adjust privacy settings regularly", "Be cautious about sharing personal information", "Think before posting about travel plans or location", "Accept friend requests from anyone", "Use strong, unique passwords for social media accounts", "Share personal details in public posts"]'::jsonb,
   '["Review and adjust privacy settings regularly", "Be cautious about sharing personal information", "Think before posting about travel plans or location", "Use strong, unique passwords for social media accounts"]',
   'Social media privacy requires ongoing vigilance: privacy settings change frequently and need regular review, personal information can be used for identity theft or social engineering, travel posts can signal empty homes to criminals, and strong passwords prevent account takeovers. Never accept unknown friend requests or share sensitive details publicly.',
   4, 9);

  -- Question 10: Email attachment safety
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'When is it safe to open an email attachment?', 
   'multiple_choice',
   '["When it comes from any known contact", "When you were expecting the attachment from a verified sender", "When the attachment has an interesting filename", "When the email says the attachment is urgent"]'::jsonb,
   'When you were expecting the attachment from a verified sender',
   'Safe attachment handling requires expectation and verification. Even known contacts can have compromised accounts sending malicious attachments. Always verify unexpected attachments through separate communication channels. Interesting filenames and urgency claims are common social engineering tactics used to bypass caution.',
   3, 10);

  -- Question 11: Password manager benefits
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'What are the main benefits of using a password manager? (Select all that apply)', 
   'multiple_correct',
   '["Generates strong, unique passwords for each account", "Remembers passwords so you don''t have to", "Automatically fills login credentials on websites", "Shares passwords with team members securely", "Makes all passwords the same for convenience", "Stores passwords in plain text files"]'::jsonb,
   '["Generates strong, unique passwords for each account", "Remembers passwords so you don''t have to", "Automatically fills login credentials on websites", "Shares passwords with team members securely"]',
   'Password managers provide comprehensive security benefits: they generate cryptographically strong unique passwords, eliminate the need to remember multiple passwords, reduce typing errors and phishing risks through auto-fill, and enable secure sharing for team accounts. They never make passwords the same or store them in plain text.',
   4, 11);

  -- Question 12: Incident reporting importance
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module2_assessment_id, 
   'Why is it important to report security incidents promptly?', 
   'multiple_choice',
   '["To avoid getting in trouble with management", "To enable quick response and minimize damage", "To blame someone else for the incident", "To satisfy legal requirements only"]'::jsonb,
   'To enable quick response and minimize damage',
   'Prompt incident reporting enables rapid response that can contain threats, prevent data loss, and minimize business impact. Early detection and response are crucial for limiting damage from cyber attacks. The goal is organizational protection, not blame assignment, though legal compliance is also important.',
   2, 12);

  -- =====================================================================
  -- COMPLETION AND VERIFICATION
  -- =====================================================================
  
  RAISE NOTICE 'Successfully created Module 2 Safe Internet Usage and Best Practices Quiz with explanations and options';
  RAISE NOTICE '- Total questions: %', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module2_assessment_id);
  RAISE NOTICE '- Assessment ID: %', module2_assessment_id;
  RAISE NOTICE '- Section ID: %', section_2_id;
  
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
WHERE a.title = 'Module 2: Safe Internet Usage and Best Practices Quiz'
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
WHERE a.title = 'Module 2: Safe Internet Usage and Best Practices Quiz'
ORDER BY aq.order_index;

COMMIT; 