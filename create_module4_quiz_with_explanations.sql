-- =====================================================================
-- MODULE 4: DATA PROTECTION & PRIVACY QUIZ WITH EXPLANATIONS
-- =====================================================================
-- Complete Module 4 assessment covering types of sensitive data,
-- data handling best practices, privacy policies, data breaches,
-- and practical data security measures.
-- Includes detailed explanations for all questions and answer options.
-- =====================================================================

BEGIN;

-- Main execution block
DO $$
DECLARE
  course_uuid uuid;
  section_4_id uuid;  -- Module 4: Data Protection & Privacy
  module4_assessment_id uuid;
  
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
  
  -- Find Module 4 section with multiple matching strategies
  -- Strategy 1: Look for "Module 4" specifically
  SELECT id INTO section_4_id 
  FROM course_sections 
  WHERE course_id = course_uuid 
    AND title ILIKE '%module 4%'
  LIMIT 1;
  
  -- Strategy 2: Look for "Data Protection" or related terms
  IF section_4_id IS NULL THEN
    SELECT id INTO section_4_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
      AND (title ILIKE '%data protection%' 
           OR title ILIKE '%privacy%'
           OR title ILIKE '%data security%')
    LIMIT 1;
  END IF;
  
  -- Strategy 3: Use fourth section by order
  IF section_4_id IS NULL THEN
    SELECT id INTO section_4_id 
    FROM course_sections 
    WHERE course_id = course_uuid 
    ORDER BY order_index 
    OFFSET 3 LIMIT 1;
  END IF;
  
  -- Approach 4: Create assessment without section if no sections exist
  IF section_4_id IS NULL THEN
    RAISE NOTICE 'No Module 4 section found. Creating course-level assessment.';
    -- We'll set section_4_id to NULL for course-level assessment
  ELSE
    RAISE NOTICE 'Using section: % (%)', 
      section_4_id, 
      (SELECT title FROM course_sections WHERE id = section_4_id);
  END IF;
  
  -- =====================================================================
  -- MODULE 4: DATA PROTECTION & PRIVACY QUIZ
  -- =====================================================================
  
  INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, section_4_id,  -- This can be NULL for course-level assessment
    'Module 4: Data Protection & Privacy Quiz',
    'Assessment covering sensitive data types, data handling procedures, privacy policies, breach consequences, and practical data security measures.',
    'quiz', 20, 3, 70, true, 4
  ) RETURNING id INTO module4_assessment_id;
  
  -- =====================================================================
  -- MODULE 4 QUESTIONS WITH DETAILED EXPLANATIONS AND OPTIONS
  -- =====================================================================
  
  -- Question 1: Types of sensitive data
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'Which of the following are considered sensitive data that require special protection? (Select all that apply)', 
   'multiple_correct',
   '["Personal Identifiable Information (PII)", "Financial records and credit card data", "Health information and medical records", "Public company information on websites", "Employee personal details", "Customer contact lists"]'::jsonb,
   '["Personal Identifiable Information (PII)", "Financial records and credit card data", "Health information and medical records", "Employee personal details", "Customer contact lists"]',
   'Sensitive data includes any information that could cause harm if disclosed: PII enables identity theft, financial data allows fraud, health information violates privacy laws, employee details can be used for social engineering, and customer lists provide competitive advantage. Public website information is already accessible and not considered sensitive.',
   4, 1);

  -- Question 2: Data classification principles
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'What is the primary purpose of data classification in an organization?', 
   'multiple_choice',
   '["To organize files alphabetically", "To determine appropriate security controls and handling procedures", "To reduce storage costs", "To improve search functionality"]'::jsonb,
   'To determine appropriate security controls and handling procedures',
   'Data classification identifies the sensitivity and value of information to apply appropriate security controls. Different data types require different protection levels: public data needs minimal protection, while confidential data requires encryption, access controls, and special handling procedures. This ensures resources are allocated efficiently based on risk.',
   3, 2);

  -- Question 3: Data handling best practices
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'Which practices represent proper data handling procedures? (Select all that apply)', 
   'multiple_correct',
   '["Use encryption for sensitive data transmission", "Follow the principle of least privilege for data access", "Regularly backup important data", "Share sensitive data via personal email", "Store data only as long as necessary", "Use approved cloud storage services only"]'::jsonb,
   '["Use encryption for sensitive data transmission", "Follow the principle of least privilege for data access", "Regularly backup important data", "Store data only as long as necessary", "Use approved cloud storage services only"]',
   'Proper data handling requires multiple safeguards: encryption protects data in transit, least privilege limits access to necessary personnel only, backups ensure data availability, retention policies prevent unnecessary exposure, and approved services meet security standards. Personal email lacks enterprise security controls and should never be used for sensitive data.',
   4, 3);

  -- Question 4: GDPR and privacy regulations
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'What rights do individuals have under privacy regulations like GDPR? (Select all that apply)', 
   'multiple_correct',
   '["Right to access their personal data", "Right to correct inaccurate information", "Right to delete personal data (right to be forgotten)", "Right to unlimited data collection", "Right to data portability", "Right to object to data processing"]'::jsonb,
   '["Right to access their personal data", "Right to correct inaccurate information", "Right to delete personal data (right to be forgotten)", "Right to data portability", "Right to object to data processing"]',
   'Privacy regulations grant individuals significant control over their data: access rights enable transparency, correction rights ensure accuracy, deletion rights allow removal of unnecessary data, portability enables moving data between services, and objection rights provide opt-out mechanisms. Regulations limit, not expand, data collection rights.',
   4, 4);

  -- Question 5: Data breach consequences
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'What are potential consequences of a data breach for an organization? (Select all that apply)', 
   'multiple_correct',
   '["Financial penalties and fines", "Loss of customer trust and reputation damage", "Legal liability and lawsuits", "Increased sales and market share", "Regulatory investigations", "Operational disruption"]'::jsonb,
   '["Financial penalties and fines", "Loss of customer trust and reputation damage", "Legal liability and lawsuits", "Regulatory investigations", "Operational disruption"]',
   'Data breaches have severe consequences: regulatory fines can reach millions, reputation damage leads to customer loss, legal liability results in costly lawsuits, investigations consume resources and management time, and operational disruption affects business continuity. Breaches never increase sales or market share - they consistently harm business performance.',
   4, 5);

  -- Question 6: Secure data disposal
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'What is the proper way to dispose of devices containing sensitive data?', 
   'multiple_choice',
   '["Simply delete files and throw away the device", "Use professional data destruction services with certificates", "Give devices to friends or family", "Sell devices online after factory reset"]'::jsonb,
   'Use professional data destruction services with certificates',
   'Proper data disposal requires professional destruction because deleted files can often be recovered using forensic tools. Professional services use DoD-approved wiping methods or physical destruction, providing certificates of destruction for compliance. Factory resets and simple deletion are insufficient for sensitive data protection.',
   3, 6);

  -- Question 7: Privacy policy understanding
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'Why is it important for employees to understand their company''s privacy policy?', 
   'multiple_choice',
   '["To increase productivity", "To ensure compliance with data protection requirements and avoid violations", "To improve customer service", "To reduce IT support requests"]'::jsonb,
   'To ensure compliance with data protection requirements and avoid violations',
   'Understanding privacy policies ensures employees handle personal data correctly, avoiding violations that could result in fines, legal action, and reputation damage. Privacy policies define what data can be collected, how it must be handled, and when it must be deleted. Employee compliance is essential for organizational data protection.',
   2, 7);

  -- Question 8: Data retention policies
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'What is the purpose of data retention policies?', 
   'multiple_choice',
   '["To keep all data forever for historical purposes", "To define how long different types of data should be kept and when to delete them", "To increase storage capacity", "To improve data processing speed"]'::jsonb,
   'To define how long different types of data should be kept and when to delete them',
   'Data retention policies balance legal requirements, business needs, and privacy rights by defining storage periods for different data types. Keeping data longer than necessary increases security risks and privacy violations, while deleting data too early may violate legal or business requirements. Proper retention reduces exposure and ensures compliance.',
   3, 8);

  -- Question 9: Incident response for data breaches
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'What should be the immediate first step when a potential data breach is discovered?', 
   'multiple_choice',
   '["Try to fix the problem yourself", "Contain the breach to prevent further data loss", "Notify all customers immediately", "Delete all evidence of the breach"]'::jsonb,
   'Contain the breach to prevent further data loss',
   'Containment is the critical first step to prevent additional data loss and limit the scope of the breach. This might involve isolating affected systems, changing passwords, or blocking network access. Notification comes later after assessment, and evidence must be preserved for investigation and legal requirements.',
   3, 9);

  -- Question 10: Personal data at work
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'How should employees handle personal data of customers and colleagues? (Select all that apply)', 
   'multiple_correct',
   '["Access only data necessary for job functions", "Keep personal data confidential and secure", "Share data freely within the organization", "Use data only for authorized business purposes", "Report suspected data misuse", "Store data on personal devices for convenience"]'::jsonb,
   '["Access only data necessary for job functions", "Keep personal data confidential and secure", "Use data only for authorized business purposes", "Report suspected data misuse"]',
   'Personal data handling requires strict controls: access should be limited to job requirements (least privilege), confidentiality prevents unauthorized disclosure, authorized use ensures compliance with privacy laws, and reporting misuse protects individuals and the organization. Never share data freely or store on personal devices as these create security vulnerabilities.',
   4, 10);

  -- Question 11: Cloud storage security
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'What security considerations apply when using cloud storage for sensitive data? (Select all that apply)', 
   'multiple_correct',
   '["Use only company-approved cloud services", "Enable encryption for data at rest and in transit", "Implement strong access controls and authentication", "Use any free cloud service available", "Regularly review and audit access permissions", "Share login credentials with team members"]'::jsonb,
   '["Use only company-approved cloud services", "Enable encryption for data at rest and in transit", "Implement strong access controls and authentication", "Regularly review and audit access permissions"]',
   'Cloud security requires comprehensive controls: approved services meet security standards, encryption protects data both stored and transmitted, strong authentication prevents unauthorized access, and regular audits ensure ongoing security. Free services often lack enterprise security features, and credential sharing violates security principles.',
   4, 11);

  -- Question 12: Data protection training importance
  INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (module4_assessment_id, 
   'Why is ongoing data protection training essential for all employees?', 
   'multiple_choice',
   '["To increase IT department workload", "To keep up with evolving threats, regulations, and best practices", "To reduce employee productivity", "To eliminate the need for technical security measures"]'::jsonb,
   'To keep up with evolving threats, regulations, and best practices',
   'Data protection training must be ongoing because threats constantly evolve, new regulations are introduced, and best practices are updated based on lessons learned. Regular training ensures employees maintain current knowledge and skills needed to protect data effectively. Training complements, not replaces, technical security measures.',
   2, 12);

  -- =====================================================================
  -- COMPLETION AND VERIFICATION
  -- =====================================================================
  
  RAISE NOTICE 'Successfully created Module 4 Data Protection & Privacy Quiz with explanations and options';
  RAISE NOTICE '- Total questions: %', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = module4_assessment_id);
  RAISE NOTICE '- Assessment ID: %', module4_assessment_id;
  RAISE NOTICE '- Section ID: %', section_4_id;
  
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
WHERE a.title = 'Module 4: Data Protection & Privacy Quiz'
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
WHERE a.title = 'Module 4: Data Protection & Privacy Quiz'
ORDER BY aq.order_index;

COMMIT; 