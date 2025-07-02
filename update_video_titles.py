#!/usr/bin/env python3
"""
Update Video Titles
Updates all video titles to be descriptive instead of numbered format
"""

# New descriptive titles for all 24 videos
NEW_TITLES = {
    # Lesson 1.1 - Introduction to Cybersecurity (5 parts)
    "1.1.1": "What is Cybersecurity and Why It Matters for Your Business",
    "1.1.2": "Understanding the Current Cyber Threat Landscape",
    "1.1.3": "Key Cybersecurity Concepts Every Employee Should Know",
    "1.1.4": "Why Small Businesses Are Prime Targets for Cyber Attacks",
    "1.1.5": "Building Your Cybersecurity Foundation - Getting Started",
    
    # Lesson 1.2 - Password Security (5 parts)
    "1.2.1": "The Anatomy of a Strong Password - Best Practices",
    "1.2.2": "Password Managers - Your Secret Weapon Against Hackers",
    "1.2.3": "Two-Factor Authentication - Adding an Extra Layer of Security",
    "1.2.4": "Common Password Mistakes That Put Your Business at Risk",
    "1.2.5": "Creating Company Password Policies That Actually Work",
    
    # Lesson 1.3 - Cyber Threats (5 parts)
    "1.3.1": "Malware Explained - Viruses, Trojans, and Ransomware",
    "1.3.2": "Social Engineering - How Hackers Manipulate People",
    "1.3.3": "Phishing Attacks - Recognizing and Avoiding Email Scams",
    "1.3.4": "Network Attacks - Protecting Your Business Infrastructure",
    "1.3.5": "Spotting the Warning Signs of a Cyber Attack",
    
    # Lesson 1.4 - Impact on SMEs (5 parts)
    "1.4.1": "The True Cost of Cyber Attacks on Small Businesses",
    "1.4.2": "When Operations Stop - Understanding Business Downtime",
    "1.4.3": "Reputation Damage - How Cyber Attacks Affect Customer Trust",
    "1.4.4": "Legal Consequences and Compliance Requirements",
    "1.4.5": "Real Case Studies - Small Businesses That Survived Cyber Attacks",
    
    # Lesson 1.5 - Employee Defense (4 parts)
    "1.5.1": "Why Every Employee is a Security Guardian",
    "1.5.2": "Creating a Security-First Culture in Your Workplace",
    "1.5.3": "Incident Reporting - What to Do When Something Goes Wrong",
    "1.5.4": "Building Accountability and Ownership in Cybersecurity"
}

def update_video_titles():
    """Update all video titles in the YouTube uploader script"""
    
    print("🔄 Updating video titles to descriptive format...")
    
    try:
        # Read the current uploader script
        with open('youtube_auto_uploader.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update each title
        updated_count = 0
        for video_key, new_title in NEW_TITLES.items():
            # Find and replace the title for this video
            old_pattern = f'"{video_key}": {{\n        "title": "[^"]*"'
            new_replacement = f'"{video_key}": {{\n        "title": "{new_title}"'
            
            if old_pattern.replace('[^"]*', '.*?') in content:
                import re
                content = re.sub(
                    f'("{video_key}": {{\\s*"title": ")[^"]*(")',
                    f'\\g<1>{new_title}\\g<2>',
                    content
                )
                updated_count += 1
                print(f"✅ Updated {video_key}: {new_title}")
        
        # Write the updated content back
        with open('youtube_auto_uploader.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"\n🎉 Successfully updated {updated_count} video titles!")
        return True
        
    except Exception as e:
        print(f"❌ Error updating titles: {e}")
        return False

def main():
    """Main execution function"""
    print("🎬 SecurGeek Video Title Updater")
    print("=" * 50)
    
    print("📋 New descriptive titles:")
    for video_key, title in NEW_TITLES.items():
        print(f"   {video_key}: {title}")
    
    print(f"\n🔄 Ready to update {len(NEW_TITLES)} video titles...")
    confirm = input("❓ Continue with update? (y/N): ").lower().strip()
    
    if confirm != 'y':
        print("❌ Update cancelled by user")
        return False
    
    success = update_video_titles()
    
    if success:
        print("\n🎉 All video titles updated successfully!")
        print("📋 Videos will now upload with descriptive titles")
        print("🚀 Ready to run YouTube uploader!")
    else:
        print("\n❌ Title update failed!")
    
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