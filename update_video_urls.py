#!/usr/bin/env python3
"""
Database Video URL Updater
Updates the course lessons with YouTube video URLs after upload
"""

import json
import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://fmksoufybswlzjmupskz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta3NvdWZ5YnN3bHpqbXVwc2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTIwNjAsImV4cCI6MjA2NTg4ODA2MH0.zBKF3pUxcpKQFhC8CEPez5LjZegKPagVFuJfpkGkmRg"

# Video to lesson mapping based on order_index in the course
# The course has lessons with order_index 0-23 (24 total lessons)
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

def load_upload_results():
    """Load the upload results from JSON file"""
    if not os.path.exists('upload_results.json'):
        print("❌ upload_results.json not found!")
        print("📋 Please run the YouTube uploader first.")
        return None
    
    with open('upload_results.json', 'r') as f:
        return json.load(f)

def get_course_info(supabase: Client):
    """Get the course information"""
    try:
        result = supabase.table('courses').select('id, title').eq('slug', 'introduction-to-cybersecurity').execute()
        
        if result.data:
            course = result.data[0]
            print(f"📚 Found course: {course['title']} (ID: {course['id']})")
            return course['id']
        else:
            print("❌ Course 'introduction-to-cybersecurity' not found!")
            print("📋 Please run the course creation SQL script first.")
            return None
            
    except Exception as e:
        print(f"❌ Error fetching course info: {e}")
        return None

def update_database_urls(supabase: Client, course_id: str, upload_results):
    """Update the database with YouTube URLs"""
    uploaded_videos = upload_results.get('uploaded_videos', {})
    
    print(f"🔄 Updating {len(uploaded_videos)} video URLs in database...")
    
    updated_count = 0
    
    for video_key, video_id in uploaded_videos.items():
        if video_key in VIDEO_TO_LESSON_MAPPING:
            order_index = VIDEO_TO_LESSON_MAPPING[video_key]
            youtube_url = f"https://www.youtube.com/watch?v={video_id}"
            
            try:
                # Update the lesson with the YouTube URL
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
    
    print(f"\n🎉 Successfully updated {updated_count} lessons!")
    return updated_count > 0

def verify_updates(supabase: Client, course_id: str, upload_results):
    """Verify that the URLs were updated correctly"""
    print("\n🔍 Verifying updates...")
    
    try:
        # Get all lessons with video URLs
        result = supabase.table('lessons').select('order_index, title, video_url').eq('course_id', course_id).order('order_index').execute()
        
        if result.data:
            print("\n📋 Current lesson video URLs:")
            for lesson in result.data:
                status = "✅" if lesson['video_url'] else "❌"
                print(f"   {status} Lesson {lesson['order_index']}: {lesson['title']}")
                if lesson['video_url']:
                    print(f"      🔗 {lesson['video_url']}")
        
    except Exception as e:
        print(f"❌ Error verifying updates: {e}")

def main():
    """Main execution function"""
    print("🔄 SecurGeek Database Video URL Updater")
    print("=" * 50)
    
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
    
    # Get course information
    course_id = get_course_info(supabase)
    if not course_id:
        return False
    
    # Show what will be updated
    print(f"\n📋 Ready to update video URLs for:")
    for video_key, video_id in uploaded_videos.items():
        if video_key in VIDEO_TO_LESSON_MAPPING:
            order_index = VIDEO_TO_LESSON_MAPPING[video_key]
            youtube_url = f"https://www.youtube.com/watch?v={video_id}"
            print(f"   📹 {video_key} (Lesson {order_index}) → {youtube_url}")
        else:
            print(f"   ⚠️ {video_key} → No mapping found")
    
    confirm = input("\n❓ Continue with database update? (y/N): ").lower().strip()
    if confirm != 'y':
        print("❌ Update cancelled by user")
        return False
    
    # Update database
    success = update_database_urls(supabase, course_id, upload_results)
    
    if success:
        print("\n🎉 Database update completed successfully!")
        print("🔗 Your course lessons now have YouTube video URLs")
        
        # Verify the updates
        verify_updates(supabase, course_id, upload_results)
        
    else:
        print("\n❌ Database update failed!")
        print("📋 Check the error messages above")
    
    return success

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Update cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

# Configuration Instructions:
"""
🔧 SETUP INSTRUCTIONS:

1. Install Supabase Python client:
   pip install supabase

2. Make sure you have:
   - Created the course using create_cybersecurity_course.sql
   - Uploaded videos using the YouTube uploader
   - Generated upload_results.json file

3. Run this script:
   python update_video_urls.py

4. The script will:
   - Load video IDs from upload_results.json
   - Map videos to lessons using order_index
   - Update lessons table with YouTube URLs
   - Verify all updates

⚠️ Make sure your Supabase RLS policies allow updates to the lessons table!
""" 