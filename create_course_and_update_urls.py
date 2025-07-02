#!/usr/bin/env python3
"""
Complete Course Creator and Video URL Updater
Creates the cybersecurity course and updates video URLs in one go
"""

import json
import os
import uuid
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://fmksoufybswlzjmupskz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta3NvdWZ5YnN3bHpqbXVwc2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTIwNjAsImV4cCI6MjA2NTg4ODA2MH0.zBKF3pUxcpKQFhC8CEPez5LjZegKPagVFuJfpkGkmRg"

# Video to lesson mapping
VIDEO_TO_LESSON_MAPPING = {
    # Module 1: Understanding Cybersecurity (order_index 0-4)
    "1.1.1": 0,   # Introduction to Cybersecurity
    "1.1.2": 1,   # Creating and Managing Secure Passwords  
    "1.1.3": 2,   # Common Cyber Threats Explained
    "1.1.4": 3,   # Impact of Cyber Attacks on SMEs
    "1.1.5": 4,   # Employees as the First Line of Defense
    
    # Module 2: Safe Use of Technology at Work (order_index 5-9)
    "1.2.1": 5,   # Safe Internet Usage and Best Practices
    "1.2.2": 6,   # Recognizing and Avoiding Phishing Attacks
    "1.2.3": 7,   # Device & Endpoint Security
    "1.2.4": 8,   # Secure Use of Wi-Fi and Remote Work
    "1.2.5": 9,   # Reporting Incidents and Red Flags
    
    # Module 3: Social Engineering & Phishing Awareness (order_index 10-14)
    "1.3.1": 10,  # What is Social Engineering
    "1.3.2": 11,  # Recognizing Phishing Attacks
    "1.3.3": 12,  # Spear Phishing and CEO Fraud
    "1.3.4": 13,  # Practical Scenarios Spot the Scam
    "1.3.5": 14,  # What to Do if You Fall for a Phish
    
    # Module 4: Data Protection & Privacy (order_index 15-19)
    "1.4.1": 15,  # Types of Sensitive Data
    "1.4.2": 16,  # Data Handling Do's and Don'ts
    "1.4.3": 17,  # Understanding Company Privacy Policies
    "1.4.4": 18,  # Data Breaches and Consequences
    "1.4.5": 19,  # Practical Data Security Measures
    
    # Module 5: Workplace Security Culture (order_index 20-23)
    "1.5.1": 20,  # Creating a Security-First Mindset
    "1.5.2": 21,  # Your Role in the Security Chain
    "1.5.3": 22,  # Gamified Security Challenges
    "1.5.4": 23   # Continuous Learning & Staying Updated
}

# Course structure
COURSE_STRUCTURE = {
    "title": "Introduction to Cybersecurity",
    "slug": "introduction-to-cybersecurity",
    "description": "A comprehensive cybersecurity training course designed for SMEs and their employees. Learn essential security practices, threat awareness, and how to protect your organization from cyber attacks.",
    "long_description": "This comprehensive cybersecurity training course is specifically designed for Small and Medium Enterprises (SMEs) and their employees. The course covers essential security practices, threat awareness, and practical strategies to protect your organization from cyber attacks. Through 5 comprehensive modules, participants will learn about cybersecurity fundamentals, safe technology usage, social engineering awareness, data protection, and building a security-conscious workplace culture.",
    "level": "beginner",
    "status": "published",
    "price": 99.99,
    "duration_hours": 8,
    "learning_objectives": [
        "Understand fundamental cybersecurity concepts and threats",
        "Implement secure password management practices", 
        "Recognize and defend against phishing and social engineering attacks",
        "Apply data protection and privacy best practices",
        "Foster a security-first mindset in the workplace"
    ],
    "tags": ["cybersecurity", "sme", "employee training", "security awareness", "phishing"],
    "is_featured": True,
    "sections": [
        {
            "title": "Understanding Cybersecurity",
            "description": "Foundation concepts of cybersecurity and its importance for businesses",
            "order_index": 0,
            "lessons": [
                {"title": "Introduction to Cybersecurity", "order_index": 0},
                {"title": "Creating and Managing Secure Passwords", "order_index": 1},
                {"title": "Common Cyber Threats Explained", "order_index": 2},
                {"title": "Impact of Cyber Attacks on SMEs", "order_index": 3},
                {"title": "Employees as the First Line of Defense", "order_index": 4}
            ]
        },
        {
            "title": "Safe Use of Technology at Work",
            "description": "Best practices for secure technology usage in the workplace",
            "order_index": 1,
            "lessons": [
                {"title": "Safe Internet Usage and Best Practices", "order_index": 5},
                {"title": "Recognizing and Avoiding Phishing Attacks", "order_index": 6},
                {"title": "Device & Endpoint Security", "order_index": 7},
                {"title": "Secure Use of Wi-Fi and Remote Work", "order_index": 8},
                {"title": "Reporting Incidents and Red Flags", "order_index": 9}
            ]
        },
        {
            "title": "Social Engineering & Phishing Awareness",
            "description": "Understanding and defending against social engineering attacks",
            "order_index": 2,
            "lessons": [
                {"title": "What is Social Engineering", "order_index": 10},
                {"title": "Recognizing Phishing Attacks", "order_index": 11},
                {"title": "Spear Phishing and CEO Fraud", "order_index": 12},
                {"title": "Practical Scenarios Spot the Scam", "order_index": 13},
                {"title": "What to Do if You Fall for a Phish", "order_index": 14}
            ]
        },
        {
            "title": "Data Protection & Privacy",
            "description": "Protecting sensitive data and understanding privacy requirements",
            "order_index": 3,
            "lessons": [
                {"title": "Types of Sensitive Data", "order_index": 15},
                {"title": "Data Handling Do's and Don'ts", "order_index": 16},
                {"title": "Understanding Company Privacy Policies", "order_index": 17},
                {"title": "Data Breaches and Consequences", "order_index": 18},
                {"title": "Practical Data Security Measures", "order_index": 19}
            ]
        },
        {
            "title": "Workplace Security Culture",
            "description": "Building and maintaining a security-conscious workplace culture",
            "order_index": 4,
            "lessons": [
                {"title": "Creating a Security-First Mindset", "order_index": 20},
                {"title": "Your Role in the Security Chain", "order_index": 21},
                {"title": "Gamified Security Challenges", "order_index": 22},
                {"title": "Continuous Learning & Staying Updated", "order_index": 23}
            ]
        }
    ]
}

def load_upload_results():
    """Load the upload results from JSON file"""
    if not os.path.exists('upload_results.json'):
        print("❌ upload_results.json not found!")
        print("📋 Please run the YouTube uploader first.")
        return None
    
    with open('upload_results.json', 'r') as f:
        return json.load(f)

def create_category(supabase: Client):
    """Create or get cybersecurity category"""
    try:
        # Check if category exists
        result = supabase.table('categories').select('id').eq('slug', 'cybersecurity').execute()
        
        if result.data:
            category_id = result.data[0]['id']
            print(f"✅ Found existing category: {category_id}")
            return category_id
        
        # Create new category
        category_data = {
            'name': 'Cybersecurity',
            'description': 'Cybersecurity training and awareness courses',
            'slug': 'cybersecurity',
            'icon': '',
            'color': '#dc2626'
        }
        
        result = supabase.table('categories').insert(category_data).execute()
        
        if result.data:
            category_id = result.data[0]['id']
            print(f"✅ Created category: {category_id}")
            return category_id
        else:
            print("❌ Failed to create category")
            return None
            
    except Exception as e:
        print(f"❌ Error with category: {e}")
        return None

def create_course(supabase: Client, category_id: str):
    """Create the cybersecurity course"""
    try:
        # Check if course exists
        result = supabase.table('courses').select('id').eq('slug', COURSE_STRUCTURE['slug']).execute()
        
        if result.data:
            course_id = result.data[0]['id']
            print(f"✅ Found existing course: {course_id}")
            return course_id
        
        # Create new course
        course_data = {
            'title': COURSE_STRUCTURE['title'],
            'slug': COURSE_STRUCTURE['slug'],
            'description': COURSE_STRUCTURE['description'],
            'long_description': COURSE_STRUCTURE['long_description'],
            'category_id': category_id,
            'level': COURSE_STRUCTURE['level'],
            'status': COURSE_STRUCTURE['status'],
            'price': COURSE_STRUCTURE['price'],
            'duration_hours': COURSE_STRUCTURE['duration_hours'],
            'learning_objectives': COURSE_STRUCTURE['learning_objectives'],
            'tags': COURSE_STRUCTURE['tags'],
            'is_featured': COURSE_STRUCTURE['is_featured']
        }
        
        result = supabase.table('courses').insert(course_data).execute()
        
        if result.data:
            course_id = result.data[0]['id']
            print(f"✅ Created course: {course_id}")
            return course_id
        else:
            print("❌ Failed to create course")
            return None
            
    except Exception as e:
        print(f"❌ Error creating course: {e}")
        return None

def create_sections_and_lessons(supabase: Client, course_id: str):
    """Create course sections and lessons"""
    try:
        print("🔄 Creating course sections and lessons...")
        
        for section_data in COURSE_STRUCTURE['sections']:
            # Create section
            section_insert = {
                'course_id': course_id,
                'title': section_data['title'],
                'description': section_data['description'],
                'order_index': section_data['order_index'],
                'is_published': True
            }
            
            result = supabase.table('course_sections').insert(section_insert).execute()
            
            if result.data:
                section_id = result.data[0]['id']
                print(f"✅ Created section: {section_data['title']}")
                
                # Create lessons for this section
                for lesson_data in section_data['lessons']:
                    lesson_insert = {
                        'course_id': course_id,
                        'section_id': section_id,
                        'title': lesson_data['title'],
                        'description': f"Learn about {lesson_data['title'].lower()} in this comprehensive lesson.",
                        'content': f"This lesson covers {lesson_data['title'].lower()} with practical examples and actionable insights for your organization.",
                        'order_index': lesson_data['order_index'],
                        'duration_minutes': 15,
                        'video_url': '',
                        'is_published': True
                    }
                    
                    lesson_result = supabase.table('lessons').insert(lesson_insert).execute()
                    
                    if lesson_result.data:
                        print(f"  ✅ Created lesson {lesson_data['order_index']}: {lesson_data['title']}")
                    else:
                        print(f"  ❌ Failed to create lesson: {lesson_data['title']}")
            else:
                print(f"❌ Failed to create section: {section_data['title']}")
        
        print("✅ Course structure created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error creating sections and lessons: {e}")
        return False

def update_video_urls(supabase: Client, course_id: str, upload_results):
    """Update lessons with YouTube URLs"""
    uploaded_videos = upload_results.get('uploaded_videos', {})
    
    print(f"🔄 Updating {len(uploaded_videos)} video URLs...")
    
    updated_count = 0
    
    for video_key, video_id in uploaded_videos.items():
        if video_key in VIDEO_TO_LESSON_MAPPING:
            order_index = VIDEO_TO_LESSON_MAPPING[video_key]
            youtube_url = f"https://www.youtube.com/watch?v={video_id}"
            
            try:
                result = supabase.table('lessons').update({
                    'video_url': youtube_url
                }).eq('course_id', course_id).eq('order_index', order_index).execute()
                
                if result.data:
                    lesson_title = result.data[0].get('title', 'Unknown')
                    print(f"✅ Updated lesson {order_index}: {lesson_title}")
                    print(f"   🔗 URL: {youtube_url}")
                    updated_count += 1
                else:
                    print(f"⚠️ No lesson found for {video_key} (order_index: {order_index})")
                    
            except Exception as e:
                print(f"❌ Error updating lesson {video_key}: {e}")
        else:
            print(f"⚠️ No mapping found for video {video_key}")
    
    print(f"\n🎉 Successfully updated {updated_count} lessons with video URLs!")
    return updated_count > 0

def verify_course_structure(supabase: Client, course_id: str):
    """Verify the complete course structure"""
    print("\n🔍 Verifying course structure...")
    
    try:
        # Get course info
        course_result = supabase.table('courses').select('title, status').eq('id', course_id).execute()
        
        if course_result.data:
            course = course_result.data[0]
            print(f"📚 Course: {course['title']} (Status: {course['status']})")
        
        # Get sections
        sections_result = supabase.table('course_sections').select('title, order_index').eq('course_id', course_id).order('order_index').execute()
        
        if sections_result.data:
            print(f"📋 Sections: {len(sections_result.data)}")
            for section in sections_result.data:
                print(f"   {section['order_index']}: {section['title']}")
        
        # Get lessons with video URLs
        lessons_result = supabase.table('lessons').select('order_index, title, video_url').eq('course_id', course_id).order('order_index').execute()
        
        if lessons_result.data:
            print(f"📹 Lessons: {len(lessons_result.data)}")
            lessons_with_videos = sum(1 for lesson in lessons_result.data if lesson['video_url'])
            print(f"🎥 Lessons with videos: {lessons_with_videos}/{len(lessons_result.data)}")
            
            print("\n📋 Lesson details:")
            for lesson in lessons_result.data:
                status = "✅" if lesson['video_url'] else "❌"
                print(f"   {status} {lesson['order_index']}: {lesson['title']}")
                if lesson['video_url']:
                    print(f"      🔗 {lesson['video_url']}")
        
    except Exception as e:
        print(f"❌ Error verifying course: {e}")

def main():
    """Main execution function"""
    print("🚀 SecurGeek Complete Course Creator & Video URL Updater")
    print("=" * 60)
    
    # Load upload results
    upload_results = load_upload_results()
    if not upload_results:
        return False
    
    uploaded_videos = upload_results.get('uploaded_videos', {})
    print(f"📋 Found {len(uploaded_videos)} uploaded videos")
    print(f"📅 Upload date: {upload_results.get('upload_date', 'Unknown')}")
    
    # Initialize Supabase client
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        return False
    
    # Create category
    print("\n🔄 Step 1: Creating/getting category...")
    category_id = create_category(supabase)
    if not category_id:
        return False
    
    # Create course
    print("\n🔄 Step 2: Creating/getting course...")
    course_id = create_course(supabase, category_id)
    if not course_id:
        return False
    
    # Create sections and lessons
    print("\n🔄 Step 3: Creating course structure...")
    if not create_sections_and_lessons(supabase, course_id):
        return False
    
    # Update video URLs
    print("\n🔄 Step 4: Updating video URLs...")
    if not update_video_urls(supabase, course_id, upload_results):
        print("⚠️ Some video URLs may not have been updated")
    
    # Verify everything
    print("\n🔄 Step 5: Verifying course structure...")
    verify_course_structure(supabase, course_id)
    
    print("\n🎉 COURSE CREATION & VIDEO URL UPDATE COMPLETE!")
    print("=" * 60)
    print("✅ Your cybersecurity course is now ready with video URLs!")
    print(f"🔗 Course ID: {course_id}")
    print("📚 You can now access the course in your platform")
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Process cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc() 