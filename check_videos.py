#!/usr/bin/env python3
"""
Video Folder Checker
Scans the video folder and shows what videos are available
"""

import os
import json
from pathlib import Path

VIDEO_FOLDER = r"C:\CyberSecurityCourses\Edited Videos"

def check_videos():
    """Check what videos are in the folder"""
    print("🔍 SecurGeek Video Folder Scanner")
    print("=" * 50)
    
    if not os.path.exists(VIDEO_FOLDER):
        print(f"❌ Video folder not found: {VIDEO_FOLDER}")
        return
    
    print(f"📁 Scanning folder: {VIDEO_FOLDER}")
    print()
    
    # Get all video files
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    found_videos = []
    
    for file_path in Path(VIDEO_FOLDER).iterdir():
        if file_path.is_file():
            file_ext = file_path.suffix.lower()
            if file_ext in video_extensions:
                found_videos.append({
                    'filename': file_path.name,
                    'stem': file_path.stem,
                    'size_mb': round(file_path.stat().st_size / (1024*1024), 1),
                    'extension': file_ext
                })
    
    # Sort by filename
    found_videos.sort(key=lambda x: x['stem'])
    
    print(f"📊 Found {len(found_videos)} video files:")
    print()
    
    total_size = 0
    for i, video in enumerate(found_videos, 1):
        print(f"{i:2d}. {video['filename']} ({video['size_mb']} MB)")
        total_size += video['size_mb']
    
    print()
    print(f"📈 Total size: {total_size:.1f} MB ({total_size/1024:.1f} GB)")
    
    # Check upload status
    uploaded = set()
    if os.path.exists('upload_results.json'):
        try:
            with open('upload_results.json', 'r') as f:
                data = json.load(f)
                uploaded = set(data.get('uploaded_videos', {}).keys())
        except:
            pass
    
    print()
    print("📋 Upload Status:")
    print(f"✅ Uploaded: {len(uploaded)} videos")
    print(f"📹 Remaining: {len(found_videos) - len(uploaded)} videos")
    
    if uploaded:
        print()
        print("✅ Already uploaded:")
        for video_key in sorted(uploaded):
            print(f"   {video_key}")
    
    remaining = [v['stem'] for v in found_videos if v['stem'] not in uploaded]
    if remaining:
        print()
        print("📹 Still need to upload:")
        for video_key in sorted(remaining):
            print(f"   {video_key}")
    
    print()
    print("🎯 Next steps:")
    if remaining:
        print("   1. Run 'run_resume_uploader.bat' to upload remaining videos")
        print("   2. Or wait until tomorrow if you hit the daily limit")
    else:
        print("   🎉 All videos have been uploaded!")
    
    return found_videos

if __name__ == "__main__":
    check_videos()
    input("\nPress Enter to exit...") 