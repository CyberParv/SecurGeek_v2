/*
  # Sample Data for SecurGeek Platform

  1. Sample Courses
    - Create sample cybersecurity courses with lessons
    - Add sample enrollments and progress
    - Create sample quizzes and resources

  2. Test Users
    - Create sample admin user
    - Create sample instructor users
    - Create sample student users

  3. Sample Content
    - Course materials and resources
    - Quiz questions and answers
    - Certificates and reviews
*/

-- Insert sample courses
INSERT INTO courses (id, title, slug, description, long_description, category_id, level, status, price, duration_hours, learning_objectives, tags, is_featured, published_at) VALUES
  (
    gen_random_uuid(),
    'Ethical Hacking Fundamentals',
    'ethical-hacking-fundamentals',
    'Learn the basics of ethical hacking and penetration testing in this comprehensive course.',
    'This course covers the fundamental concepts of ethical hacking, including reconnaissance, scanning, enumeration, vulnerability assessment, and exploitation techniques. You will learn how to think like a hacker to better defend against cyber attacks.',
    (SELECT id FROM categories WHERE slug = 'penetration-testing'),
    'beginner',
    'published',
    99.99,
    20,
    ARRAY['Understand ethical hacking principles', 'Perform reconnaissance and scanning', 'Identify vulnerabilities', 'Use penetration testing tools', 'Write professional reports'],
    ARRAY['ethical hacking', 'penetration testing', 'cybersecurity', 'security assessment'],
    true,
    now()
  ),
  (
    gen_random_uuid(),
    'Advanced Penetration Testing',
    'advanced-penetration-testing',
    'Master advanced penetration testing techniques and methodologies.',
    'Take your penetration testing skills to the next level with advanced techniques including web application testing, wireless security, social engineering, and post-exploitation techniques.',
    (SELECT id FROM categories WHERE slug = 'penetration-testing'),
    'advanced',
    'published',
    199.99,
    35,
    ARRAY['Master advanced exploitation techniques', 'Perform web application testing', 'Conduct wireless security assessments', 'Execute post-exploitation activities', 'Develop custom exploits'],
    ARRAY['advanced penetration testing', 'web security', 'wireless security', 'exploit development'],
    true,
    now()
  ),
  (
    gen_random_uuid(),
    'Incident Response and Digital Forensics',
    'incident-response-digital-forensics',
    'Learn how to respond to security incidents and conduct digital forensic investigations.',
    'This course teaches you how to effectively respond to cybersecurity incidents, preserve evidence, conduct forensic analysis, and recover from security breaches.',
    (SELECT id FROM categories WHERE slug = 'incident-response'),
    'intermediate',
    'published',
    149.99,
    25,
    ARRAY['Develop incident response procedures', 'Conduct digital forensic analysis', 'Preserve and analyze evidence', 'Create incident reports', 'Implement recovery strategies'],
    ARRAY['incident response', 'digital forensics', 'malware analysis', 'evidence preservation'],
    false,
    now()
  ),
  (
    gen_random_uuid(),
    'Network Security Essentials',
    'network-security-essentials',
    'Secure your network infrastructure with proven security techniques.',
    'Learn how to design, implement, and maintain secure network architectures. This course covers firewalls, VPNs, intrusion detection systems, and network monitoring.',
    (SELECT id FROM categories WHERE slug = 'network-security'),
    'intermediate',
    'published',
    129.99,
    18,
    ARRAY['Design secure network architectures', 'Configure firewalls and VPNs', 'Implement intrusion detection', 'Monitor network traffic', 'Respond to network threats'],
    ARRAY['network security', 'firewalls', 'vpn', 'intrusion detection', 'network monitoring'],
    false,
    now()
  );

-- Insert sample lessons for the first course
INSERT INTO lessons (course_id, title, description, content, duration_minutes, order_index, is_preview) VALUES
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Introduction to Ethical Hacking',
    'Overview of ethical hacking principles and methodologies',
    'In this lesson, we will explore the fundamental concepts of ethical hacking, including the difference between ethical hackers and malicious attackers, legal considerations, and the ethical hacking methodology.',
    45,
    1,
    true
  ),
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Reconnaissance Techniques',
    'Learn passive and active information gathering techniques',
    'This lesson covers various reconnaissance techniques including OSINT, social media intelligence, DNS enumeration, and network scanning.',
    60,
    2,
    false
  ),
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Vulnerability Scanning',
    'Identify vulnerabilities using automated tools',
    'Learn how to use vulnerability scanners like Nessus, OpenVAS, and Nmap to identify potential security weaknesses in target systems.',
    55,
    3,
    false
  ),
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Web Application Testing',
    'Test web applications for common vulnerabilities',
    'Explore common web application vulnerabilities including SQL injection, XSS, CSRF, and learn how to test for these issues using tools like Burp Suite.',
    75,
    4,
    false
  ),
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Reporting and Documentation',
    'Create professional penetration testing reports',
    'Learn how to document your findings and create professional reports that communicate security risks effectively to stakeholders.',
    40,
    5,
    false
  );

-- Insert sample quizzes
INSERT INTO quizzes (course_id, title, description, time_limit_minutes, passing_score, max_attempts, is_required, order_index) VALUES
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Ethical Hacking Fundamentals Quiz',
    'Test your understanding of ethical hacking principles and basic techniques',
    30,
    80,
    3,
    true,
    1
  );

-- Insert sample quiz questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (
    (SELECT id FROM quizzes WHERE title = 'Ethical Hacking Fundamentals Quiz'),
    'What is the primary difference between ethical hacking and malicious hacking?',
    'multiple_choice',
    '["Authorization and intent", "Technical skills required", "Tools used", "Time of day performed"]',
    'Authorization and intent',
    'Ethical hacking is performed with proper authorization and the intent to improve security, while malicious hacking is unauthorized and intended to cause harm.',
    2,
    1
  ),
  (
    (SELECT id FROM quizzes WHERE title = 'Ethical Hacking Fundamentals Quiz'),
    'Which phase comes first in the ethical hacking methodology?',
    'multiple_choice',
    '["Reconnaissance", "Scanning", "Enumeration", "Exploitation"]',
    'Reconnaissance',
    'Reconnaissance is the first phase where information about the target is gathered passively and actively.',
    2,
    2
  ),
  (
    (SELECT id FROM quizzes WHERE title = 'Ethical Hacking Fundamentals Quiz'),
    'OSINT stands for Open Source Intelligence.',
    'true_false',
    '["True", "False"]',
    'True',
    'OSINT (Open Source Intelligence) refers to intelligence gathered from publicly available sources.',
    1,
    3
  );

-- Insert sample resources
INSERT INTO resources (course_id, title, description, file_type, is_public) VALUES
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Ethical Hacking Checklist',
    'A comprehensive checklist for ethical hacking engagements',
    'pdf',
    false
  ),
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Common Vulnerability Database',
    'Reference guide for common vulnerabilities and their exploitation',
    'pdf',
    false
  ),
  (
    (SELECT id FROM courses WHERE slug = 'ethical-hacking-fundamentals'),
    'Penetration Testing Tools Guide',
    'Guide to essential penetration testing tools and their usage',
    'pdf',
    false
  );

-- Note: To create an admin user, you'll need to:
-- 1. Sign up normally through the application
-- 2. Then run this SQL to make that user an admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';