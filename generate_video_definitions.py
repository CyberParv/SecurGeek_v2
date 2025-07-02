#!/usr/bin/env python3
"""
Video Definition Generator
Scans your video folder and generates the COURSE_VIDEOS dictionary for the uploader
"""

import os
import re
from pathlib import Path

# Configuration
VIDEO_FOLDER = r"C:\CyberSecurityCourses\Edited Videos"
OUTPUT_FILE = "generated_video_definitions.py"

# Lesson topics (customize these based on your content)
LESSON_TOPICS = {
    "1.1": "Introduction to Cybersecurity",
    "1.2": "Creating and Managing Secure Passwords", 
    "1.3": "Common Cyber Threats Explained",
    "1.4": "Impact of Cyber Attacks on SMEs",
    "1.5": "Employees as the First Line of Defense"
}

def scan_video_files():
    """Scan the video folder and return organized video files"""
    if not os.path.exists(VIDEO_FOLDER):
        print(f"❌ Video folder not found: {VIDEO_FOLDER}")
        return {}
    
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    found_videos = {}
    
    print(f"🔍 Scanning folder: {VIDEO_FOLDER}")
    
    for file_path in Path(VIDEO_FOLDER).iterdir():
        if file_path.is_file():
            file_name = file_path.stem
            file_ext = file_path.suffix.lower()
            
            if file_ext in video_extensions:
                # Match pattern like 1.1.1, 1.2.3, etc.
                match = re.match(r'^(\d+\.\d+)\.(\d+)$', file_name)
                if match:
                    lesson = match.group(1)  # e.g., "1.1"
                    part = match.group(2)    # e.g., "1"
                    
                    if lesson not in found_videos:
                        found_videos[lesson] = []
                    
                    found_videos[lesson].append({
                        'full_name': file_name,
                        'lesson': lesson,
                        'part': part,
                        'file_path': str(file_path)
                    })
                    
                    print(f"✅ Found: {file_name}{file_ext}")
                else:
                    print(f"⚠️ Skipping (wrong format): {file_name}{file_ext}")
    
    # Sort parts within each lesson
    for lesson in found_videos:
        found_videos[lesson].sort(key=lambda x: int(x['part']))
    
    return found_videos

def generate_video_definition(video_info, part_num, total_parts):
    """Generate a single video definition"""
    lesson = video_info['lesson']
    part = video_info['part']
    full_name = video_info['full_name']
    
    # Get lesson topic
    lesson_topic = LESSON_TOPICS.get(lesson, f"Lesson {lesson}")
    
    # Generate title
    if total_parts > 1:
        title = f"{full_name} {lesson_topic} - Part {part} | SecurGeek Cybersecurity Course"
    else:
        title = f"{full_name} {lesson_topic} | SecurGeek Cybersecurity Course"
    
    # Generate description
    description = f'''🔒 Module {full_name} of our comprehensive Introduction to Cybersecurity course!

📚 In this lesson{"" if total_parts == 1 else " part"}, you'll learn:
• Key concepts related to {lesson_topic.lower()}
• Practical applications for SME environments
• Best practices and implementation strategies
• Real-world examples and case studies

⏰ Duration: ~10-15 minutes
🎯 Target Audience: SME employees and business owners
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
📖 Course Materials & Quizzes: SecurGeek.com/courses

📋 Module 1 - Understanding Cybersecurity:
{generate_course_navigation(lesson, part, total_parts)}

🏷️ Tags: cybersecurity training, business security, employee training, {lesson_topic.lower()}

© SecurGeek - Making Cybersecurity Accessible for SMEs'''
    
    # Generate tags
    base_tags = ["cybersecurity", "training", "business security", "employee training", "SME security"]
    topic_tags = lesson_topic.lower().replace(" ", " ").split()
    tags = base_tags + topic_tags
    
    return {
        'title': title,
        'description': description,
        'tags': tags
    }

def generate_course_navigation(current_lesson, current_part, total_parts):
    """Generate the course navigation section"""
    nav_lines = []
    
    for lesson_key in sorted(LESSON_TOPICS.keys()):
        topic = LESSON_TOPICS[lesson_key]
        
        if lesson_key == current_lesson:
            nav_lines.append(f"{lesson_key} {topic}")
            if total_parts > 1:
                for i in range(1, total_parts + 1):
                    marker = " ← You are here" if str(i) == current_part else ""
                    nav_lines.append(f"├── {lesson_key}.{i} {topic} - Part {i}{marker}")
            else:
                nav_lines.append(f"├── {lesson_key}.{current_part} {topic} ← You are here")
        else:
            nav_lines.append(f"{lesson_key} {topic}")
    
    return "\n".join(nav_lines)

def generate_definitions_file(found_videos):
    """Generate the complete video definitions file"""
    
    print(f"\n📝 Generating video definitions...")
    
    definitions = []
    upload_order = []
    
    # Process each lesson in order
    for lesson in sorted(found_videos.keys()):
        videos = found_videos[lesson]
        total_parts = len(videos)
        
        print(f"📋 Processing lesson {lesson} ({total_parts} parts)")
        
        for i, video_info in enumerate(videos, 1):
            full_name = video_info['full_name']
            upload_order.append(full_name)
            
            definition = generate_video_definition(video_info, video_info['part'], total_parts)
            
            # Format the definition
            def_text = f'''    "{full_name}": {{
        "title": "{definition['title']}",
        "description": """{definition['description']}""",
        "tags": {definition['tags']}
    }}'''
            
            definitions.append(def_text)
    
    # Generate the complete file content
    file_content = f'''#!/usr/bin/env python3
"""
Generated Video Definitions
Auto-generated from video files in: {VIDEO_FOLDER}
"""

# Generated COURSE_VIDEOS dictionary
COURSE_VIDEOS = {{
{",\\n".join(definitions)}
}}

# Generated upload order
UPLOAD_ORDER = {upload_order}

# Instructions:
# 1. Copy the COURSE_VIDEOS dictionary above
# 2. Replace the COURSE_VIDEOS in youtube_auto_uploader.py
# 3. Update the upload_order list with UPLOAD_ORDER above
# 4. Customize titles, descriptions, and tags as needed

print("✅ Generated definitions for {{}} videos".format(len(COURSE_VIDEOS)))
print("📋 Upload order:", UPLOAD_ORDER)
'''
    
    # Write to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(file_content)
    
    print(f"💾 Saved to: {OUTPUT_FILE}")
    return len(definitions)

def main():
    """Main execution function"""
    print("🚀 SecurGeek Video Definition Generator")
    print("=" * 50)
    
    # Scan video files
    found_videos = scan_video_files()
    
    if not found_videos:
        print("❌ No valid video files found!")
        print("📋 Make sure your videos are named like: 1.1.1, 1.1.2, 1.2.1, etc.")
        return False
    
    # Summary
    total_videos = sum(len(videos) for videos in found_videos.values())
    print(f"\n📊 Found {total_videos} videos across {len(found_videos)} lessons:")
    
    for lesson in sorted(found_videos.keys()):
        videos = found_videos[lesson]
        topic = LESSON_TOPICS.get(lesson, f"Lesson {lesson}")
        print(f"   • {lesson} - {topic}: {len(videos)} parts")
    
    # Generate definitions
    generated_count = generate_definitions_file(found_videos)
    
    print(f"\n🎉 Successfully generated {generated_count} video definitions!")
    print(f"📋 Next steps:")
    print(f"   1. Open {OUTPUT_FILE} to review the generated definitions")
    print(f"   2. Copy the COURSE_VIDEOS dictionary to youtube_auto_uploader.py")
    print(f"   3. Update the upload_order list")
    print(f"   4. Customize titles and descriptions as needed")
    print(f"   5. Run the YouTube uploader!")
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Generation cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc() 