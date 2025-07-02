#!/usr/bin/env python3
"""
Update YouTube Uploader with Generated Definitions
Automatically updates the main uploader script with all video definitions
"""

import re

def update_youtube_uploader():
    """Update the YouTube uploader with generated definitions"""
    
    print("🔄 Updating YouTube uploader with generated definitions...")
    
    # Load generated definitions
    try:
        with open('generated_video_definitions.py', 'r', encoding='utf-8') as f:
            generated_content = f.read()
        
        # Extract COURSE_VIDEOS dictionary
        course_videos_match = re.search(r'COURSE_VIDEOS = \{(.*?)\}', generated_content, re.DOTALL)
        if not course_videos_match:
            print("❌ Could not find COURSE_VIDEOS in generated file")
            return False
        
        course_videos_content = course_videos_match.group(0)
        
        # Extract UPLOAD_ORDER list
        upload_order_match = re.search(r'UPLOAD_ORDER = (\[.*?\])', generated_content)
        if not upload_order_match:
            print("❌ Could not find UPLOAD_ORDER in generated file")
            return False
        
        upload_order_content = upload_order_match.group(1)
        
    except FileNotFoundError:
        print("❌ generated_video_definitions.py not found!")
        print("📋 Please run generate_video_definitions.py first")
        return False
    
    # Load main uploader file
    try:
        with open('youtube_auto_uploader.py', 'r', encoding='utf-8') as f:
            uploader_content = f.read()
    except FileNotFoundError:
        print("❌ youtube_auto_uploader.py not found!")
        return False
    
    # Replace COURSE_VIDEOS dictionary
    uploader_content = re.sub(
        r'COURSE_VIDEOS = \{.*?\}',
        course_videos_content,
        uploader_content,
        flags=re.DOTALL
    )
    
    # Replace upload_order list
    uploader_content = re.sub(
        r'upload_order = \[.*?\]  # Add more as needed',
        f'upload_order = {upload_order_content}',
        uploader_content
    )
    
    # Write updated content back
    try:
        with open('youtube_auto_uploader.py', 'w', encoding='utf-8') as f:
            f.write(uploader_content)
        
        print("✅ Successfully updated youtube_auto_uploader.py")
        print("📋 Updated with 24 video definitions")
        print("🚀 Ready to run YouTube uploader!")
        return True
        
    except Exception as e:
        print(f"❌ Error writing to file: {e}")
        return False

def main():
    """Main execution function"""
    print("🔄 SecurGeek YouTube Uploader Updater")
    print("=" * 50)
    
    success = update_youtube_uploader()
    
    if success:
        print("\n🎉 Update completed successfully!")
        print("📋 Next steps:")
        print("   1. Set up Google Cloud credentials (client_secrets.json)")
        print("   2. Run: python youtube_auto_uploader.py")
        print("   3. Or double-click: run_youtube_uploader.bat")
    else:
        print("\n❌ Update failed!")
        print("📋 Please check the error messages above")
    
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