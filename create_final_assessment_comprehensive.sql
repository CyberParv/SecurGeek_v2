  -- =====================================================================
  -- FINAL CYBERSECURITY CERTIFICATION ASSESSMENT
  -- =====================================================================
  -- Comprehensive final assessment covering all 5 modules of the cybersecurity course
  -- Serves as certification exam with higher difficulty and comprehensive coverage
  -- Includes detailed explanations for all questions and answer options.
  -- =====================================================================

  BEGIN;

  -- Main execution block
  DO $$
  DECLARE
    course_uuid uuid;
    final_section_id uuid;  -- Final Assessment Section
    final_assessment_id uuid;
    
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
    
      -- Create Final Assessment section
  INSERT INTO course_sections (
    course_id, title, description, order_index
  ) VALUES (
    course_uuid,
    'Final Assessment',
    'Comprehensive certification exam covering all cybersecurity fundamentals from Modules 1-5. This assessment validates complete understanding of cybersecurity principles and practical application.',
    999 -- High order index to place at end
  ) RETURNING id INTO final_section_id;
    
    RAISE NOTICE 'Created Final Assessment section: % (%)', 
      final_section_id, 
      'Final Assessment';
    
    -- =====================================================================
    -- FINAL CYBERSECURITY CERTIFICATION ASSESSMENT
    -- =====================================================================
    
      INSERT INTO assessments (
    course_id, section_id, title, description, assessment_type, time_limit_minutes, max_attempts, passing_score, is_required, order_index
  ) VALUES (
    course_uuid, final_section_id,
    'Cybersecurity Certification Final Exam',
    'Comprehensive certification exam covering cybersecurity fundamentals, safe technology practices, social engineering awareness, data protection, and security culture. Passing this exam demonstrates mastery of essential cybersecurity knowledge and skills.',
    'final', 60, 3, 75, true, 1
  ) RETURNING id INTO final_assessment_id;
    
    -- =====================================================================
    -- FINAL ASSESSMENT QUESTIONS - COMPREHENSIVE COVERAGE
    -- =====================================================================
    
    -- MODULE 1 COVERAGE: Cybersecurity Fundamentals
    
    -- Question 1: CIA Triad comprehensive understanding
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'A company discovers that customer data has been altered by an attacker, but the data remains accessible to authorized users and has not been disclosed to unauthorized parties. Which aspect of the CIA triad has been compromised?', 
    'multiple_choice',
    '["Confidentiality", "Integrity", "Availability", "Authentication"]'::jsonb,
    'Integrity',
    'Integrity refers to maintaining data accuracy and preventing unauthorized modification. In this scenario, the data was altered (integrity compromised) but remains accessible (availability intact) and wasn''t disclosed (confidentiality maintained). This demonstrates how different aspects of the CIA triad can be independently affected.',
    3, 1);

    -- Question 2: Password security advanced
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'Which password strategy provides the BEST security for an organization? (Select all that apply)', 
    'multiple_correct',
    '["Mandatory password changes every 30 days", "Use of password managers for unique passwords", "Multi-factor authentication on all accounts", "Complex passwords with 16+ characters", "Password reuse across similar systems", "Biometric authentication where available"]'::jsonb,
    '["Use of password managers for unique passwords", "Multi-factor authentication on all accounts", "Complex passwords with 16+ characters", "Biometric authentication where available"]',
    'Modern password security emphasizes quality over frequent changes: password managers enable unique, strong passwords for every account; MFA provides crucial second-factor protection; long, complex passwords resist cracking attempts; and biometrics add convenient security layers. Frequent mandatory changes often lead to weaker, predictable passwords.',
    4, 2);

    -- Question 3: Threat landscape understanding
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'An employee receives an email with a Word document attachment claiming to be an invoice. Opening the document enables macros that download and install malware. This attack combines which threat types?', 
    'multiple_choice',
    '["Only phishing", "Only malware", "Phishing and malware", "Social engineering and ransomware"]'::jsonb,
    'Phishing and malware',
    'This attack uses phishing (deceptive email with malicious attachment) to deliver malware (malicious software installed via macros). The email deceives the recipient into opening a malicious attachment, which then installs harmful software. This demonstrates how modern attacks often combine multiple threat vectors for greater effectiveness.',
    3, 3);

    -- MODULE 2 COVERAGE: Safe Technology Use
    
    -- Question 4: Advanced phishing recognition
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'You receive an email that appears to be from your bank with perfect grammar, official logos, and a legitimate-looking sender address. It asks you to verify your account by clicking a link due to "suspicious activity." What should make you suspicious? (Select all that apply)', 
    'multiple_correct',
    '["Banks never request account verification via email", "The urgency created by mentioning suspicious activity", "Any request to click links in unsolicited emails", "The email asks for account verification", "The professional appearance of the email", "The use of official logos and branding"]'::jsonb,
    '["Banks never request account verification via email", "The urgency created by mentioning suspicious activity", "Any request to click links in unsolicited emails", "The email asks for account verification"]',
    'Modern phishing attacks appear highly professional and legitimate. Key warning signs include: legitimate institutions never request sensitive actions via email, urgency tactics pressure quick decisions, unsolicited links are dangerous regardless of source, and requests for verification are major red flags. Professional appearance and official branding can be easily copied by attackers.',
    4, 4);

    -- Question 5: Remote work security scenario
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'While working remotely from a coffee shop, you need to access sensitive company data. What is the most secure approach?', 
    'multiple_choice',
    '["Use the coffee shop Wi-Fi with HTTPS websites only", "Connect through a company VPN before accessing any work resources", "Use your mobile hotspot instead of public Wi-Fi", "Wait until you return to the office"]'::jsonb,
    'Connect through a company VPN before accessing any work resources',
    'Company VPNs provide the highest security by encrypting all traffic and routing it through secure company infrastructure. This protects against Wi-Fi eavesdropping, man-in-the-middle attacks, and provides secure access to company resources. While mobile hotspots are safer than public Wi-Fi, VPNs provide comprehensive protection regardless of the underlying connection.',
    3, 5);

    -- Question 6: Device security comprehensive
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'Which device security measures are essential for protecting against both physical and digital threats? (Select all that apply)', 
    'multiple_correct',
    '["Full disk encryption", "Automatic screen locks with strong PINs", "Remote wipe capabilities", "Regular security updates", "Antivirus software", "Storing passwords in browser without master password"]'::jsonb,
    '["Full disk encryption", "Automatic screen locks with strong PINs", "Remote wipe capabilities", "Regular security updates", "Antivirus software"]',
    'Comprehensive device security addresses multiple threat vectors: encryption protects data if devices are stolen, screen locks prevent unauthorized access, remote wipe enables data protection when devices are lost, updates patch security vulnerabilities, and antivirus detects malware. Storing passwords without master password protection creates security vulnerabilities.',
    4, 6);

    -- MODULE 3 COVERAGE: Social Engineering & Phishing
    
    -- Question 7: Advanced social engineering scenario
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'An attacker calls your office pretending to be from the IT help desk. They mention specific details about your recent computer issues and ask for your password to "complete the fix remotely." This attack uses which social engineering techniques? (Select all that apply)', 
    'multiple_correct',
    '["Authority impersonation", "Pretexting with researched information", "Creating false sense of urgency", "Building credibility through specific details", "Quid pro quo offering help", "Baiting with physical media"]'::jsonb,
    '["Authority impersonation", "Pretexting with researched information", "Creating false sense of urgency", "Building credibility through specific details", "Quid pro quo offering help"]',
    'This sophisticated attack combines multiple social engineering techniques: impersonating IT authority figures, using researched information (pretexting) to build credibility, creating urgency around computer problems, leveraging specific details to appear legitimate, and offering help in exchange for access (quid pro quo). This demonstrates how attackers layer multiple psychological manipulation tactics.',
    4, 7);

    -- Question 8: Business Email Compromise (CEO Fraud)
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'You work in the finance department and receive an urgent email appearing to be from your CEO requesting an immediate wire transfer to a "confidential acquisition target." The email bypasses normal approval processes due to "time sensitivity." What should you do?', 
    'multiple_choice',
    '["Process the transfer immediately as requested by the CEO", "Call the CEO directly using a known phone number to verify the request", "Forward the email to your manager for approval", "Reply to the email asking for more details"]'::jsonb,
    'Call the CEO directly using a known phone number to verify the request',
    'This is a classic CEO fraud/Business Email Compromise attack. Always verify unusual financial requests through independent communication channels using contact information you know is legitimate, not information provided in the suspicious communication. The urgency and bypass of normal procedures are major red flags requiring verification.',
    3, 8);

    -- Question 9: Spear phishing identification
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'What makes spear phishing attacks particularly dangerous compared to mass phishing campaigns?', 
    'multiple_choice',
    '["They use more sophisticated technical exploits", "They are personalized with researched information about specific targets", "They always contain malware attachments", "They target only high-level executives"]'::jsonb,
    'They are personalized with researched information about specific targets',
    'Spear phishing''s danger lies in personalization - attackers research targets using social media, company websites, and public records to craft convincing, targeted messages. This personalization makes the attacks much more believable and effective than generic mass phishing. The customization exploits trust and familiarity to bypass skepticism.',
    3, 9);

    -- MODULE 4 COVERAGE: Data Protection & Privacy
    
    -- Question 10: Data breach response priorities
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'Your organization discovers that customer personal data has been accessed by unauthorized individuals. What should be the immediate response priorities? (Select all that apply)', 
    'multiple_correct',
    '["Contain the breach to prevent further data loss", "Assess the scope and impact of the breach", "Notify law enforcement immediately", "Document all actions taken", "Begin customer notifications within 24 hours", "Preserve evidence for investigation"]'::jsonb,
    '["Contain the breach to prevent further data loss", "Assess the scope and impact of the breach", "Document all actions taken", "Preserve evidence for investigation"]',
    'Immediate breach response focuses on damage control and evidence preservation: containment prevents additional data loss, assessment determines the scope and required responses, documentation supports investigation and compliance, and evidence preservation enables forensic analysis. Customer notifications and law enforcement contact follow assessment, with specific timing requirements varying by jurisdiction.',
    4, 10);

    -- Question 11: GDPR compliance scenario
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'A customer requests deletion of all their personal data from your systems under GDPR "right to be forgotten." However, you are legally required to retain some financial records for tax purposes. What is the correct approach?', 
    'multiple_choice',
    '["Delete all data as requested", "Refuse the request due to legal retention requirements", "Delete data not subject to legal retention requirements and explain what must be kept", "Transfer the data to a third party for storage"]'::jsonb,
    'Delete data not subject to legal retention requirements and explain what must be kept',
    'GDPR balances individual rights with legitimate business and legal requirements. When deletion requests conflict with legal retention obligations, organizations must delete what they legally can while clearly explaining what must be retained and why. This demonstrates compliance with both privacy rights and legal obligations.',
    3, 11);

    -- Question 12: Data classification and handling
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'Which data handling practices align with the principle of "data minimization"? (Select all that apply)', 
    'multiple_correct',
    '["Collect only data necessary for specific business purposes", "Retain data only as long as needed for those purposes", "Limit access to data based on job requirements", "Share data freely within the organization", "Store all data indefinitely for potential future use", "Regularly review and purge unnecessary data"]'::jsonb,
    '["Collect only data necessary for specific business purposes", "Retain data only as long as needed for those purposes", "Limit access to data based on job requirements", "Regularly review and purge unnecessary data"]',
    'Data minimization reduces privacy risks by limiting data collection, retention, and access to what''s necessary: collect only required data, retain it only as long as needed for legitimate purposes, restrict access based on job functions, and regularly purge unnecessary data. Free sharing and indefinite storage violate minimization principles and increase security risks.',
    4, 12);

    -- MODULE 5 COVERAGE: Security Culture
    
    -- Question 13: Security culture assessment
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'Which indicators suggest an organization has a strong security culture? (Select all that apply)', 
    'multiple_correct',
    '["Employees regularly report suspicious activities without fear", "Security training participation rates are high", "Incident response times are decreasing", "Employees ask questions about security procedures", "Security policies are rarely violated", "Phishing simulation success rates are improving"]'::jsonb,
    '["Employees regularly report suspicious activities without fear", "Security training participation rates are high", "Incident response times are decreasing", "Employees ask questions about security procedures", "Phishing simulation success rates are improving"]',
    'Strong security culture manifests through employee engagement and behavior: fearless reporting indicates trust and awareness, high training participation shows commitment, faster response times reflect preparedness, questioning demonstrates active thinking about security, and improving phishing resistance shows practical learning. Perfect policy compliance is unrealistic and may indicate fear rather than understanding.',
    4, 13);

    -- Question 14: Individual security responsibility
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'As an employee, what is your most important role in organizational cybersecurity?', 
    'multiple_choice',
    '["Installing and maintaining security software", "Being the first line of defense through awareness and vigilance", "Conducting security audits and assessments", "Managing firewall configurations"]'::jsonb,
    'Being the first line of defense through awareness and vigilance',
    'Employees serve as the critical first line of defense because they interact with emails, websites, and systems daily, encountering most threats before technical controls can respond. Employee awareness, vigilance, and proper decision-making prevent the majority of successful cyber attacks. Technical security management is typically handled by specialized IT staff.',
    3, 14);

    -- COMPREHENSIVE SCENARIO QUESTIONS
    
    -- Question 15: Multi-vector attack scenario
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'An attacker researches your company on social media, calls pretending to be a vendor, and tricks an employee into providing network access credentials. The attacker then uses these credentials to access customer data. This attack demonstrates which cybersecurity principles? (Select all that apply)', 
    'multiple_correct',
    '["Social engineering can bypass technical security controls", "Human factors are critical security vulnerabilities", "Defense in depth requires multiple security layers", "Data access should follow least privilege principles", "Security awareness training is essential", "Technical controls alone are insufficient"]'::jsonb,
    '["Social engineering can bypass technical security controls", "Human factors are critical security vulnerabilities", "Defense in depth requires multiple security layers", "Data access should follow least privilege principles", "Security awareness training is essential", "Technical controls alone are insufficient"]',
    'This scenario illustrates fundamental cybersecurity principles: social engineering bypasses technical defenses by targeting humans, people represent critical vulnerabilities requiring training and awareness, multiple security layers could have prevented or limited the attack, proper access controls would have minimized data exposure, and comprehensive security requires both technical and human elements.',
    5, 15);

    -- Question 16: Risk assessment and response
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'Your small business has limited cybersecurity budget. Which security investments should be prioritized to achieve maximum risk reduction?', 
    'multiple_choice',
    '["Advanced threat detection systems", "Employee security awareness training and basic security controls", "Expensive cybersecurity insurance", "Hiring dedicated security personnel"]'::jsonb,
    'Employee security awareness training and basic security controls',
    'For small businesses with limited budgets, employee training and basic controls (strong passwords, MFA, updated software, backups) provide the highest return on security investment. These address the most common attack vectors and create a security-aware workforce. Advanced systems and dedicated personnel are valuable but should come after establishing fundamental security practices.',
    3, 16);

    -- Question 17: Incident learning and improvement
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'After a security incident, your organization should focus on which activities to prevent similar future incidents? (Select all that apply)', 
    'multiple_correct',
    '["Conducting blame-free post-incident analysis", "Identifying root causes and systemic issues", "Updating policies and procedures based on lessons learned", "Punishing employees involved in the incident", "Sharing lessons learned across the organization", "Implementing additional security controls to address gaps"]'::jsonb,
    '["Conducting blame-free post-incident analysis", "Identifying root causes and systemic issues", "Updating policies and procedures based on lessons learned", "Sharing lessons learned across the organization", "Implementing additional security controls to address gaps"]',
    'Effective incident response focuses on learning and improvement: blame-free analysis encourages honest evaluation, root cause analysis identifies systemic issues rather than individual mistakes, policy updates address identified gaps, knowledge sharing prevents similar incidents elsewhere, and additional controls strengthen defenses. Punishment discourages reporting and learning.',
    4, 17);

    -- Question 18: Technology and human factors integration
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'The most effective cybersecurity approach combines technical controls with human factors. Which statement best describes this integration?', 
    'multiple_choice',
    '["Technical controls are sufficient if properly configured", "Human training can replace most technical security measures", "Technical controls and human awareness work together to create layered defense", "Human factors are only important for small businesses"]'::jsonb,
    'Technical controls and human awareness work together to create layered defense',
    'Effective cybersecurity requires integration of technical and human elements: technical controls provide automated protection and monitoring, while human awareness enables recognition and response to threats that bypass technical measures. Neither alone is sufficient - they must work together to create comprehensive, layered defense against diverse and evolving threats.',
    3, 18);

    -- PRACTICAL APPLICATION QUESTIONS
    
    -- Question 19: Real-world application
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'You notice unusual network activity on your work computer, including slow performance and unexpected pop-ups. What should be your immediate response sequence?', 
    'multiple_choice',
    '["Continue working and ignore the issues", "Disconnect from the network and report to IT security immediately", "Try to fix the problems yourself using online tutorials", "Restart the computer and see if problems persist"]'::jsonb,
    'Disconnect from the network and report to IT security immediately',
    'Suspected malware infections require immediate containment and professional response: disconnecting prevents data theft and lateral movement to other systems, while immediate reporting enables rapid professional response. Self-repair attempts may worsen the situation or destroy evidence needed for investigation and recovery.',
    3, 19);

    -- Question 20: Comprehensive security mindset
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (final_assessment_id, 
    'Which statement best represents a mature cybersecurity mindset for employees?', 
    'multiple_choice',
    '["Security is the IT department''s job, not mine", "I should be suspicious of everything and everyone", "I am part of the security team and my actions affect organizational security", "Perfect security is achievable if we follow all policies"]'::jsonb,
    'I am part of the security team and my actions affect organizational security',
    'A mature security mindset recognizes that every employee plays a crucial role in organizational security through their daily decisions and actions. This balanced perspective acknowledges individual responsibility while maintaining productive work relationships and realistic expectations about security capabilities. It emphasizes empowerment rather than fear or abdication of responsibility.',
    3, 20);

    -- =====================================================================
    -- COMPLETION AND VERIFICATION
    -- =====================================================================
    
      RAISE NOTICE 'Successfully created Cybersecurity Certification Final Exam';
  RAISE NOTICE '- Total questions: %', (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = final_assessment_id);
  RAISE NOTICE '- Assessment ID: %', final_assessment_id;
  RAISE NOTICE '- Section ID: %', final_section_id;
  RAISE NOTICE '- Time limit: 60 minutes';
  RAISE NOTICE '- Passing score: 75%%';
  RAISE NOTICE '- Max attempts: 3';
    
  END $$;

  -- =====================================================================
  -- VERIFICATION QUERIES
  -- =====================================================================

  -- Display the created final assessment
  SELECT 
    a.title as assessment_title,
    a.assessment_type,
    COUNT(aq.id) as question_count,
    a.time_limit_minutes,
    a.max_attempts,
    a.passing_score,
    SUM(aq.points) as total_points
  FROM assessments a
  LEFT JOIN assessment_questions aq ON a.id = aq.assessment_id
  WHERE a.title = 'Cybersecurity Certification Final Exam'
  GROUP BY a.id, a.title, a.assessment_type, a.time_limit_minutes, a.max_attempts, a.passing_score;

  -- Display all final exam questions
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
  WHERE a.title = 'Cybersecurity Certification Final Exam'
  ORDER BY aq.order_index;

  -- Module coverage analysis
  SELECT 
    CASE 
      WHEN aq.order_index BETWEEN 1 AND 3 THEN 'Module 1: Cybersecurity Fundamentals'
      WHEN aq.order_index BETWEEN 4 AND 6 THEN 'Module 2: Safe Technology Use'
      WHEN aq.order_index BETWEEN 7 AND 9 THEN 'Module 3: Social Engineering & Phishing'
      WHEN aq.order_index BETWEEN 10 AND 12 THEN 'Module 4: Data Protection & Privacy'
      WHEN aq.order_index BETWEEN 13 AND 14 THEN 'Module 5: Security Culture'
      ELSE 'Comprehensive Scenarios'
    END as module_coverage,
    COUNT(*) as question_count,
    SUM(aq.points) as total_points
  FROM assessment_questions aq
  JOIN assessments a ON aq.assessment_id = a.id
  WHERE a.title = 'Cybersecurity Certification Final Exam'
  GROUP BY 
    CASE 
      WHEN aq.order_index BETWEEN 1 AND 3 THEN 'Module 1: Cybersecurity Fundamentals'
      WHEN aq.order_index BETWEEN 4 AND 6 THEN 'Module 2: Safe Technology Use'
      WHEN aq.order_index BETWEEN 7 AND 9 THEN 'Module 3: Social Engineering & Phishing'
      WHEN aq.order_index BETWEEN 10 AND 12 THEN 'Module 4: Data Protection & Privacy'
      WHEN aq.order_index BETWEEN 13 AND 14 THEN 'Module 5: Security Culture'
      ELSE 'Comprehensive Scenarios'
    END
  ORDER BY MIN(aq.order_index);

  COMMIT; 