-- =====================================================================
-- COMPLETE CYBERSECURITY COURSE ASSESSMENTS - ALL MODULES (1-5)
-- =====================================================================
-- Master script to create all module quizzes with explanations and proper formatting
-- Modules 1-5: Complete cybersecurity training assessment system
-- =====================================================================

-- Execute Module 1: Understanding Cybersecurity
\i create_module1_quiz_with_explanations.sql

-- Execute Module 2: Safe Use of Technology at Work  
\i create_module2_quiz_with_explanations.sql

-- Execute Module 3: Social Engineering & Phishing Awareness
\i create_module3_quiz_with_explanations.sql

-- Execute Module 4: Data Protection & Privacy
\i create_module4_quiz_with_explanations.sql

-- Execute Module 5: Workplace Security Culture
\i create_module5_quiz_with_explanations.sql

-- =====================================================================
-- COMPREHENSIVE VERIFICATION AND SUMMARY
-- =====================================================================

-- Summary of all created assessments
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
WHERE a.title LIKE '%Module%Quiz%'
GROUP BY a.id, a.title, a.assessment_type, a.time_limit_minutes, a.max_attempts, a.passing_score
ORDER BY a.title;

-- Total statistics across all modules
SELECT 
  COUNT(DISTINCT a.id) as total_assessments,
  COUNT(aq.id) as total_questions,
  SUM(aq.points) as total_points,
  AVG(a.time_limit_minutes) as avg_time_limit,
  AVG(a.passing_score) as avg_passing_score
FROM assessments a
LEFT JOIN assessment_questions aq ON a.id = aq.assessment_id
WHERE a.title LIKE '%Module%Quiz%';

-- Question type distribution
SELECT 
  aq.question_type,
  COUNT(*) as question_count,
  ROUND(AVG(aq.points), 1) as avg_points
FROM assessment_questions aq
JOIN assessments a ON aq.assessment_id = a.id
WHERE a.title LIKE '%Module%Quiz%'
GROUP BY aq.question_type
ORDER BY question_count DESC;

RAISE NOTICE '=====================================================================';
RAISE NOTICE 'CYBERSECURITY COURSE ASSESSMENT SYSTEM COMPLETE';
RAISE NOTICE '=====================================================================';
RAISE NOTICE 'Successfully created comprehensive assessment system with:';
RAISE NOTICE '- 5 Module Quizzes covering all cybersecurity fundamentals';
RAISE NOTICE '- Detailed explanations for every question';
RAISE NOTICE '- Proper JSON formatting for multiple choice options';
RAISE NOTICE '- Progressive difficulty and comprehensive coverage';
RAISE NOTICE '- Industry-standard cybersecurity content';
RAISE NOTICE '=====================================================================';

-- =====================================================================
-- QUICK REFERENCE: MODULE STRUCTURE
-- =====================================================================

/*
🧩 Module 1: Understanding Cybersecurity (13 questions, 30 min)
- Cybersecurity fundamentals and CIA triad
- Password security and two-factor authentication  
- Common cyber threats (malware, phishing, ransomware)
- Impact on SMEs and business consequences
- Employee responsibilities and first line of defense

🛡 Module 2: Safe Use of Technology at Work (12 questions, 20 min)
- Safe browsing practices and website verification
- Phishing email recognition and response
- Device and endpoint security measures
- Wi-Fi safety and remote work practices
- Software downloads and social media privacy

🔍 Module 3: Social Engineering & Phishing Awareness (12 questions, 25 min)
- Social engineering tactics and psychology
- Phishing vs spear phishing vs CEO fraud
- Attack vectors and recognition techniques
- Practical scenarios and incident response
- Building organizational resilience

🔒 Module 4: Data Protection & Privacy (12 questions, 20 min)
- Types of sensitive data and classification
- Data handling best practices and GDPR rights
- Breach consequences and incident response
- Secure disposal and retention policies
- Cloud storage security and training importance

🔧 Module 5: Workplace Security Culture (10 questions, 20 min)
- Security-first mindset and individual roles
- Continuous learning and gamification
- Security champions and culture measurement
- Leadership influence and incident learning
- Building strong organizational security culture

TOTAL: 59 questions across 5 comprehensive modules
*/ 