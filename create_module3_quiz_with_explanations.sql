-- =====================================================================
-- MODULE 3: SOCIAL ENGINEERING & PHISHING AWARENESS QUIZ WITH EXPLANATIONS
-- =====================================================================
-- Complete Module 3 assessment covering social engineering fundamentals,
-- phishing recognition, spear phishing, CEO fraud, practical scenarios,
-- and incident response procedures.
-- Includes detailed explanations for all questions and answer options.
-- =====================================================================

BEGIN;

-- Main execution block
DO $$
DECLARE
  course_uuid uuid;
  section_3_id uuid;  -- Module 3: Social Engineering & Phishing Awareness
  module3_assessment_id uuid;
  
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
  
  -- Find Module 3 section with multiple matching strategies
  -- Strategy 1: Look for "Module 3" specifically
  SELECT id INTO section_3_id 
  FROM course_sections 
  WHERE course_id = course_uuid 
    AND title ILIKE '%module 3%'
  LIMIT 1;
  
  -- Strategy 2: Look for "Social Engineering" or related terms
  IF section_3_id IS NULL THEN
    SELECT id INTO section_3_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
      AND (title ILIKE '%social engineering%' 
           OR title ILIKE '%phishing awareness%'
           OR title ILIKE '%phishing%')
    LIMIT 1;
  END IF;
  
  -- Strategy 3: Use third section by order
  IF section_3_id IS NULL THEN
    SELECT id INTO section_3_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
    ORDER BY order_index 
    OFFSET 2 LIMIT 1;
  END IF;
  
  -- Approach 4: Create assessment without section if no sections exist
  IF section_3_id IS NULL THEN
    RAISE NOTICE 'No Module 3 section found. Creating course-level assessment.';
    -- We'll set section_3_id to NULL for course-level assessment
  ELSE
    RAISE NOTICE 'Using section: % (%)', 
      section_3_id, 
      (SELECT title FROM course_sections WHERE id = section_3_id);
  END IF;
  
  -- =====================================================================
  -- MODULE 3: SOCIAL ENGINEERING & PHISHING AWARENESS QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_3_id,  -- This can be NULL for course-level assessment
    'Module 3: Social Engineering & Phishing Awareness Quiz',
    'Assessment covering social engineering tactics, phishing recognition, spear phishing, CEO fraud, practical scenarios, and proper incident response.',
    'quiz', 25, 3, 70, true, 3
  ) RETURNING id INTO module3_assessment_id;
  
  -- =====================================================================
  -- MODULE 3 QUESTIONS WITH DETAILED EXPLANATIONS AND OPTIONS
  -- =====================================================================
  
  -- Question 1: What is social engineering
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'What is social engineering in the context of cybersecurity?', 
   'multiple_choice',
   '["A method of building secure network infrastructure", "Manipulating people to divulge confidential information or perform actions", "A type of antivirus software", "A programming technique for secure applications"]'::jsonb,
   'Manipulating people to divulge confidential information or perform actions',
   'Social engineering exploits human psychology rather than technical vulnerabilities. Attackers use manipulation, deception, and psychological pressure to trick people into breaking security procedures, revealing sensitive information, or granting unauthorized access. It''s often easier to manipulate humans than to hack technical systems.',
   3, 1);

  -- Question 2: Common social engineering tactics
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'Which of the following are common social engineering tactics? (Select all that apply)', 
   'multiple_correct',
   '["Creating false sense of urgency", "Impersonating authority figures", "Building trust and rapport", "Using technical jargon to confuse", "Offering help or assistance", "Using complex encryption methods"]'::jsonb,
   '["Creating false sense of urgency", "Impersonating authority figures", "Building trust and rapport", "Using technical jargon to confuse", "Offering help or assistance"]',
   'Social engineers use psychological manipulation: urgency bypasses rational thinking, authority impersonation leverages respect for hierarchy, trust-building reduces suspicion, technical jargon creates confusion and compliance, and offering help exploits reciprocity. Complex encryption is a technical security measure, not a social engineering tactic.',
   4, 2);

  -- Question 3: Phishing email identification
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'Which email characteristic is the STRONGEST indicator of a phishing attempt?', 
   'multiple_choice',
   '["Poor grammar and spelling errors", "Urgent request for personal information via email", "Colorful graphics and images", "Long email content"]'::jsonb,
   'Urgent request for personal information via email',
   'Legitimate organizations never request sensitive personal information (passwords, SSNs, account numbers) via email. This is the most reliable phishing indicator. While poor grammar was once common, modern phishing emails often have perfect language. Graphics and length are not reliable security indicators.',
   3, 3);

  -- Question 4: Spear phishing vs regular phishing
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'How does spear phishing differ from regular phishing?', 
   'multiple_choice',
   '["Spear phishing uses more colorful graphics", "Spear phishing targets specific individuals with personalized information", "Spear phishing only targets executives", "Spear phishing uses different email protocols"]'::jsonb,
   'Spear phishing targets specific individuals with personalized information',
   'Spear phishing is highly targeted, using researched personal information about specific individuals to make attacks more convincing. Attackers gather details from social media, company websites, and public records to craft personalized messages. This personalization makes spear phishing much more effective than mass phishing campaigns.',
   3, 4);

  -- Question 5: CEO fraud characteristics
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'What are key characteristics of CEO fraud (Business Email Compromise)? (Select all that apply)', 
   'multiple_correct',
   '["Impersonates senior executives or trusted partners", "Requests urgent financial transactions or data", "Uses official-looking email addresses", "Bypasses normal approval processes", "Always contains malicious attachments", "Targets finance and HR departments"]'::jsonb,
   '["Impersonates senior executives or trusted partners", "Requests urgent financial transactions or data", "Uses official-looking email addresses", "Bypasses normal approval processes", "Targets finance and HR departments"]',
   'CEO fraud exploits organizational hierarchy and trust: impersonation leverages authority, urgency prevents verification, official-looking addresses appear legitimate, bypassing processes avoids detection, and targeting finance/HR maximizes access to money and sensitive data. These attacks typically don''t use attachments to avoid detection.',
   4, 5);

  -- Question 6: Recognizing phishing URLs
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'Which URL is most likely to be a phishing attempt?', 
   'multiple_choice',
   '["https://www.amazon.com/account", "https://www.arnazon.com/account", "https://amazon.com/login", "https://secure.amazon.com/verify"]'::jsonb,
   'https://www.arnazon.com/account',
   'The URL "arnazon.com" uses typosquatting - replacing "m" with "rn" to create a visually similar but different domain. This is a common phishing technique. The other URLs, while potentially suspicious in context, use the legitimate amazon.com domain. Always carefully examine URLs character by character.',
   2, 6);

  -- Question 7: Social engineering attack vectors
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'Through which channels can social engineering attacks occur? (Select all that apply)', 
   'multiple_correct',
   '["Email and messaging", "Phone calls (vishing)", "Text messages (smishing)", "Social media platforms", "In-person interactions", "Only through email"]'::jsonb,
   '["Email and messaging", "Phone calls (vishing)", "Text messages (smishing)", "Social media platforms", "In-person interactions"]',
   'Social engineering attacks use multiple channels: email remains most common, vishing (voice phishing) uses phone calls, smishing targets SMS/text messages, social media provides personal information for targeting, and in-person attacks exploit physical access and face-to-face trust. Multi-channel awareness is essential for comprehensive protection.',
   4, 7);

  -- Question 8: Pretexting scenario
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'Someone calls claiming to be from IT support and asks for your password to "fix a security issue." What should you do?', 
   'multiple_choice',
   '["Provide the password since they are from IT", "Ask for their employee ID and call them back", "Hang up and contact IT through official channels to verify", "Give them a fake password to test if they are legitimate"]'::jsonb,
   'Hang up and contact IT through official channels to verify',
   'This is a classic pretexting attack. Legitimate IT support never requests passwords over the phone. Always verify unexpected requests through official channels using contact information you know is correct, not information provided by the caller. This prevents impersonation attacks.',
   3, 8);

  -- Question 9: Baiting attack recognition
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'You find a USB drive in the parking lot labeled "Employee Salary Information." What is the safest action?', 
   'multiple_choice',
   '["Plug it into your work computer to see if you can identify the owner", "Take it home and check it on your personal computer", "Turn it in to security without plugging it into any device", "Share it with colleagues to help find the owner"]'::jsonb,
   'Turn it in to security without plugging it into any device',
   'This is a baiting attack - using physical media with enticing labels to spread malware. USB drives can contain malware that executes automatically when connected. Never plug unknown USB devices into any computer. Security personnel have safe procedures for handling suspicious devices.',
   3, 9);

  -- Question 10: Quid pro quo attacks
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'What is a "quid pro quo" social engineering attack?', 
   'multiple_choice',
   '["Offering a service or benefit in exchange for information or access", "Sending threatening messages to force compliance", "Impersonating a specific person the victim knows", "Creating fake websites to steal credentials"]'::jsonb,
   'Offering a service or benefit in exchange for information or access',
   'Quid pro quo attacks offer something valuable (technical support, free software, prizes) in exchange for information or system access. Attackers exploit the psychological principle of reciprocity - people feel obligated to return favors. Common examples include fake tech support calls offering to fix non-existent problems.',
   2, 10);

  -- Question 11: If you fall for a phishing attack
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'What should you do immediately if you realize you''ve fallen for a phishing attack? (Select all that apply)', 
   'multiple_correct',
   '["Change passwords for affected accounts immediately", "Disconnect from the internet to prevent further damage", "Report the incident to IT security team", "Monitor accounts for unauthorized activity", "Delete all emails to hide the evidence", "Run antivirus scans on your devices"]'::jsonb,
   '["Change passwords for affected accounts immediately", "Report the incident to IT security team", "Monitor accounts for unauthorized activity", "Run antivirus scans on your devices"]',
   'Immediate response is crucial: change passwords to prevent unauthorized access, report incidents for professional response and to protect others, monitor for suspicious activity to catch unauthorized use quickly, and scan for malware that may have been installed. Don''t disconnect internet (prevents security updates) or delete evidence (needed for investigation).',
   4, 11);

  -- Question 12: Building organizational resilience
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module3_assessment_id, 
   'How can organizations build resilience against social engineering attacks? (Select all that apply)', 
   'multiple_correct',
   '["Regular security awareness training", "Implementing verification procedures for sensitive requests", "Creating a culture where questioning is encouraged", "Punishing employees who fall for attacks", "Establishing clear incident reporting procedures", "Relying solely on technical security measures"]'::jsonb,
   '["Regular security awareness training", "Implementing verification procedures for sensitive requests", "Creating a culture where questioning is encouraged", "Establishing clear incident reporting procedures"]',
   'Organizational resilience requires: ongoing training to keep awareness current, verification procedures to catch social engineering attempts, supportive culture encouraging questions without fear, and clear reporting procedures for quick response. Punishment discourages reporting, and technical measures alone cannot address human-targeted attacks.',
   4, 12);

  -- =====================================================================
  -- COMPLETION AND VERIFICATION
  -- =====================================================================
  
  RAISE NOTICE 'Successfully created Module 3 Social Engineering & Phishing Awareness Quiz with explanations and options';
  RAISE NOTICE '- Total questions: %', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module3_assessment_id);
  RAISE NOTICE '- Assessment ID: %', module3_assessment_id;
  RAISE NOTICE '- Section ID: %', section_3_id;
  
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
WHERE a.title = 'Module 3: Social Engineering & Phishing Awareness Quiz'
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
WHERE a.title = 'Module 3: Social Engineering & Phishing Awareness Quiz'
ORDER BY aq.order_index;

COMMIT; 