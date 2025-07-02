#!/usr/bin/env python3
"""
SecurGeek YouTube Resume Uploader
Resumes uploading videos that haven't been uploaded yet due to daily limits
"""

import os
import sys
import json
import time
import logging
from pathlib import Path
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# YouTube API settings
SCOPES = ['https://www.googleapis.com/auth/youtube']
API_SERVICE_NAME = 'youtube'
API_VERSION = 'v3'

# Video settings
VIDEO_FOLDER = r"C:\CyberSecurityCourses\Edited Videos"
CREDENTIALS_FILE = 'client_secrets.json'
TOKEN_FILE = 'token.json'

# Your existing playlist ID
EXISTING_PLAYLIST_ID = "PLte6sJQfKkGmsf5ieNLE-YNpV7oV8y-Zy"

# Course structure with correct titles from your course structure
COURSE_VIDEOS = {
    # Module 1: Understanding Cybersecurity
    "1.1.1": {
        "title": "Introduction to Cybersecurity",
        "description": """🔒 Learn the fundamentals of cybersecurity and why it's crucial for your business!

📚 In this lesson, you'll discover:
• What cybersecurity means in today's digital world
• Why every business needs a cybersecurity strategy
• The evolving threat landscape facing organizations
• Essential security concepts every employee should know

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: cybersecurity fundamentals, business security, cyber awareness

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["cybersecurity", "business security", "fundamentals", "cyber awareness", "SME security"]
    },
    "1.1.2": {
        "title": "Creating and Managing Secure Passwords",
        "description": """🔑 Master the art of password security to protect your accounts and data!

📚 In this lesson, you'll learn:
• How to create strong, unbreakable passwords
• Password manager tools and best practices
• Two-factor authentication setup and benefits
• Common password mistakes that put you at risk

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: password security, authentication, password managers

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["password security", "authentication", "password managers", "2FA", "account protection"]
    },
    "1.1.3": {
        "title": "Common Cyber Threats Explained",
        "description": """🚨 Understand the cyber threats targeting your business every day!

📚 In this lesson, you'll explore:
• Major types of malware and how they work
• Social engineering and manipulation tactics
• Phishing attacks and how to spot them
• Ransomware and data breach scenarios

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: cyber threats, malware, phishing, ransomware

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["cyber threats", "malware", "phishing", "ransomware", "social engineering"]
    },
    "1.1.4": {
        "title": "Impact of Cyber Attacks on SMEs",
        "description": """💰 Discover the real cost of cyber attacks on small and medium businesses!

📚 In this lesson, you'll understand:
• Financial impact of cyber attacks on SMEs
• Operational disruptions and downtime costs
• Reputation damage and customer trust loss
• Legal consequences and compliance requirements

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: cyber attack impact, SME security, business continuity

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["cyber attack impact", "SME security", "business continuity", "financial impact"]
    },
    "1.1.5": {
        "title": "Employees as the First Line of Defense",
        "description": """🛡️ Learn why every employee is a crucial part of your cybersecurity defense!

📚 In this lesson, you'll discover:
• Why human factors are critical in cybersecurity
• How to build a security-conscious culture
• Employee responsibilities and best practices
• Creating accountability in cybersecurity

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: employee security, security culture, human factors

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["employee security", "security culture", "human factors", "security awareness"]
    },

    # Module 2: Safe Use of Technology at Work
    "1.2.1": {
        "title": "Safe Internet Usage and Best Practices",
        "description": """🌐 Master safe internet practices for secure business operations!

📚 In this lesson, you'll learn:
• Safe browsing techniques and habits
• How to identify suspicious websites and links
• Best practices for downloading and installing software
• Secure online communication guidelines

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: internet safety, safe browsing, online security

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["internet safety", "safe browsing", "online security", "web security"]
    },
    "1.2.2": {
        "title": "Recognizing and Avoiding Phishing Attacks",
        "description": """🎣 Learn to spot and avoid phishing attacks that target businesses!

📚 In this lesson, you'll master:
• How to identify phishing emails and messages
• Common phishing techniques and red flags
• What to do if you suspect a phishing attempt
• Reporting procedures and best practices

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: phishing protection, email security, scam awareness

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["phishing protection", "email security", "scam awareness", "threat detection"]
    },
    "1.2.3": {
        "title": "Device & Endpoint Security",
        "description": """💻 Secure your devices and endpoints from cyber threats!

📚 In this lesson, you'll learn:
• Essential device security configurations
• Antivirus and endpoint protection tools
• Mobile device security best practices
• USB and removable media safety

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: device security, endpoint protection, mobile security

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["device security", "endpoint protection", "mobile security", "antivirus"]
    },
    "1.2.4": {
        "title": "Secure Use of Wi-Fi and Remote Work",
        "description": """📶 Stay secure while working remotely and using public Wi-Fi!

📚 In this lesson, you'll discover:
• Public Wi-Fi risks and safety measures
• VPN usage for secure remote connections
• Home network security best practices
• Remote work security guidelines

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: Wi-Fi security, remote work, VPN, network security

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["Wi-Fi security", "remote work", "VPN", "network security"]
    },
    "1.2.5": {
        "title": "Reporting Incidents and Red Flags",
        "description": """🚩 Learn when and how to report cybersecurity incidents effectively!

📚 In this lesson, you'll understand:
• How to recognize potential security incidents
• Proper incident reporting procedures
• Who to contact and when to escalate
• Documentation and follow-up best practices

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: incident reporting, security procedures, threat response

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["incident reporting", "security procedures", "threat response", "escalation"]
    },

    # Module 3: Social Engineering & Phishing Awareness
    "1.3.1": {
        "title": "What is Social Engineering",
        "description": """🎭 Understand social engineering tactics used by cybercriminals!

📚 In this lesson, you'll explore:
• Definition and psychology of social engineering
• Common social engineering techniques
• How attackers manipulate human behavior
• Real-world examples and case studies

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: social engineering, manipulation tactics, human psychology

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["social engineering", "manipulation tactics", "human psychology", "cyber attacks"]
    },
    "1.3.2": {
        "title": "Recognizing Phishing Attacks",
        "description": """🎣 Master the art of identifying and avoiding phishing attacks!

📚 In this lesson, you'll learn:
• Advanced phishing recognition techniques
• Email header analysis and verification
• URL inspection and link safety
• Phishing simulation exercises

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: phishing recognition, email analysis, threat identification

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["phishing recognition", "email analysis", "threat identification", "scam detection"]
    },
    "1.3.3": {
        "title": "Spear Phishing and CEO Fraud",
        "description": """🎯 Protect against targeted spear phishing and CEO fraud attacks!

📚 In this lesson, you'll understand:
• Difference between phishing and spear phishing
• CEO fraud and business email compromise
• How attackers research and target victims
• Advanced protection strategies

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: spear phishing, CEO fraud, targeted attacks

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["spear phishing", "CEO fraud", "targeted attacks", "business email compromise"]
    },
    "1.3.4": {
        "title": "Practical Scenarios Spot the Scam",
        "description": """🔍 Practice identifying scams with real-world scenarios!

📚 In this lesson, you'll practice:
• Interactive scam identification exercises
• Real phishing email examples and analysis
• Decision-making scenarios and responses
• Building your scam detection skills

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: scam detection, practical exercises, threat recognition

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["scam detection", "practical exercises", "threat recognition", "interactive training"]
    },
    "1.3.5": {
        "title": "What to Do if You Fall for a Phish",
        "description": """🆘 Learn the immediate steps to take if you've been phished!

📚 In this lesson, you'll discover:
• Immediate response actions after a phishing incident
• How to minimize damage and secure accounts
• Reporting procedures and documentation
• Recovery strategies and lessons learned

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: incident response, phishing recovery, damage control

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["incident response", "phishing recovery", "damage control", "security procedures"]
    },

    # Module 4: Data Protection & Privacy
    "1.4.1": {
        "title": "Types of Sensitive Data",
        "description": """📊 Identify and classify different types of sensitive business data!

📚 In this lesson, you'll learn:
• Categories of sensitive and confidential data
• Personal identifiable information (PII)
• Financial and payment card data protection
• Intellectual property and trade secrets

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: data classification, sensitive data, PII protection

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["data classification", "sensitive data", "PII protection", "data privacy"]
    },
    "1.4.2": {
        "title": "Data Handling Do's and Don'ts",
        "description": """✅ Master proper data handling practices to protect sensitive information!

📚 In this lesson, you'll understand:
• Best practices for data collection and storage
• Secure data transmission methods
• Data retention and disposal procedures
• Access controls and permission management

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: data handling, data security, best practices

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["data handling", "data security", "best practices", "data protection"]
    },
    "1.4.3": {
        "title": "Understanding Company Privacy Policies",
        "description": """📋 Navigate and understand privacy policies and compliance requirements!

📚 In this lesson, you'll explore:
• Key components of privacy policies
• GDPR, CCPA, and other privacy regulations
• Employee responsibilities under privacy laws
• How to implement privacy by design

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: privacy policies, GDPR, compliance, data governance

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["privacy policies", "GDPR", "compliance", "data governance"]
    },
    "1.4.4": {
        "title": "Data Breaches and Consequences",
        "description": """💥 Understand the serious consequences of data breaches!

📚 In this lesson, you'll learn about:
• Common causes of data breaches
• Legal and financial consequences
• Reputation damage and customer impact
• How to prevent and respond to breaches

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: data breaches, consequences, breach prevention

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["data breaches", "consequences", "breach prevention", "incident response"]
    },
    "1.4.5": {
        "title": "Practical Data Security Measures",
        "description": """🔐 Implement practical measures to secure your organization's data!

📚 In this lesson, you'll discover:
• Encryption and data protection technologies
• Backup and recovery strategies
• Physical security for data protection
• Creating a data security action plan

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: data security measures, encryption, backup strategies

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["data security measures", "encryption", "backup strategies", "data protection"]
    },

    # Module 5: Workplace Security Culture
    "1.5.1": {
        "title": "Creating a Security-First Mindset",
        "description": """🧠 Develop a security-first mindset throughout your organization!

📚 In this lesson, you'll learn:
• Building security awareness and culture
• Leadership's role in cybersecurity
• Encouraging proactive security behaviors
• Making security everyone's responsibility

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: security mindset, security culture, leadership

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["security mindset", "security culture", "leadership", "organizational security"]
    },
    "1.5.2": {
        "title": "Your Role in the Security Chain",
        "description": """🔗 Understand your critical role in your organization's security chain!

📚 In this lesson, you'll explore:
• Individual responsibilities in cybersecurity
• How personal actions affect organizational security
• Building security habits and routines
• Accountability and ownership in security

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: security responsibility, personal accountability, security habits

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["security responsibility", "personal accountability", "security habits", "individual role"]
    },
    "1.5.3": {
        "title": "Gamified Security Challenges",
        "description": """🎮 Engage with fun, gamified cybersecurity challenges and exercises!

📚 In this lesson, you'll participate in:
• Interactive security simulations
• Gamified learning experiences
• Team-based security challenges
• Skills assessment and improvement

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: gamified learning, security challenges, interactive training

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["gamified learning", "security challenges", "interactive training", "skills assessment"]
    },
    "1.5.4": {
        "title": "Continuous Learning & Staying Updated",
        "description": """📚 Build a culture of continuous cybersecurity learning and improvement!

📚 In this lesson, you'll discover:
• Importance of ongoing security education
• Staying current with emerging threats
• Building learning resources and networks
• Creating sustainable security training programs

⏰ Duration: ~15 minutes
🎯 Target Audience: Business owners and employees
📈 Skill Level: Beginner

🔗 Complete Course: Available exclusively at SecurGeek.com
🏷️ Tags: continuous learning, security education, threat awareness

© SecurGeek - Making Cybersecurity Accessible for SMEs""",
        "tags": ["continuous learning", "security education", "threat awareness", "ongoing training"]
    }
}

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_uploaded_videos():
    """Load list of already uploaded videos"""
    uploaded = set()
    
    if os.path.exists('upload_results.json'):
        try:
            with open('upload_results.json', 'r') as f:
                data = json.load(f)
                uploaded = set(data.get('uploaded_videos', {}).keys())
                logger.info(f"📋 Found {len(uploaded)} previously uploaded videos")
        except Exception as e:
            logger.warning(f"⚠️ Could not load upload results: {e}")
    
    return uploaded

def find_remaining_videos():
    """Find videos that haven't been uploaded yet"""
    uploaded = load_uploaded_videos()
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    remaining_files = {}
    
    if not os.path.exists(VIDEO_FOLDER):
        logger.error(f"❌ Video folder not found: {VIDEO_FOLDER}")
        return {}
    
    logger.info(f"🔍 Scanning folder: {VIDEO_FOLDER}")
    
    for file_path in Path(VIDEO_FOLDER).iterdir():
        if file_path.is_file():
            file_name = file_path.stem
            file_ext = file_path.suffix.lower()
            
            if file_ext in video_extensions:
                if file_name in COURSE_VIDEOS and file_name not in uploaded:
                    remaining_files[file_name] = str(file_path)
                    logger.info(f"📹 Remaining: {file_name} - {COURSE_VIDEOS[file_name]['title']}")
                elif file_name in uploaded:
                    logger.info(f"✅ Already uploaded: {file_name}")
    
    logger.info(f"📊 Summary: {len(uploaded)} uploaded, {len(remaining_files)} remaining")
    return remaining_files

class YouTubeResumeUploader:
    def __init__(self):
        self.youtube = None
        self.playlist_id = EXISTING_PLAYLIST_ID
        
    def authenticate(self):
        """Authenticate with YouTube API"""
        creds = None
        
        # Load existing token
        if os.path.exists(TOKEN_FILE):
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        
        # If no valid credentials, get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(CREDENTIALS_FILE):
                    logger.error(f"❌ {CREDENTIALS_FILE} not found!")
                    return False
                
                flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials for next run
            with open(TOKEN_FILE, 'w') as token:
                token.write(creds.to_json())
        
        self.youtube = build(API_SERVICE_NAME, API_VERSION, credentials=creds)
        logger.info("✅ Successfully authenticated with YouTube API")
        return True
    
    def upload_video(self, video_key, file_path):
        """Upload a single video with all settings"""
        try:
            video_data = COURSE_VIDEOS[video_key]
            
            # Video metadata
            body = {
                'snippet': {
                    'title': video_data['title'],
                    'description': video_data['description'],
                    'tags': video_data['tags'],
                    'categoryId': '27',  # Education category
                    'defaultLanguage': 'en',
                    'defaultAudioLanguage': 'en'
                },
                'status': {
                    'privacyStatus': 'unlisted',
                    'embeddable': True,
                    'publicStatsViewable': False,
                    'madeForKids': False
                }
            }
            
            # Upload with maximum quality
            media = MediaFileUpload(
                file_path,
                chunksize=-1,
                resumable=True,
                mimetype='video/*'
            )
            
            logger.info(f"🚀 Uploading {video_key}: {video_data['title']}")
            
            # Execute upload
            insert_request = self.youtube.videos().insert(
                part=','.join(body.keys()),
                body=body,
                media_body=media
            )
            
            video_id = self._resumable_upload(insert_request)
            
            if video_id:
                logger.info(f"✅ Upload successful! Video ID: {video_id}")
                logger.info(f"🔗 URL: https://youtube.com/watch?v={video_id}")
                
                # Add to existing playlist
                self._add_to_playlist(video_id, video_key)
                
                # Wait between uploads to avoid rate limits
                logger.info("⏳ Waiting 10 seconds before next upload...")
                time.sleep(10)
                
                return video_id
            else:
                logger.error(f"❌ Upload failed for {video_key}")
                return None
                
        except HttpError as e:
            if "uploadLimitExceeded" in str(e):
                logger.error(f"🚫 Daily upload limit reached! Try again tomorrow.")
                logger.info(f"💡 You can resume from video {video_key} tomorrow")
                return "LIMIT_EXCEEDED"
            else:
                logger.error(f"❌ Error uploading {video_key}: {e}")
                return None
        except Exception as e:
            logger.error(f"❌ Error uploading {video_key}: {e}")
            return None
    
    def _resumable_upload(self, insert_request):
        """Handle resumable upload with progress tracking"""
        response = None
        error = None
        retry = 0
        
        while response is None:
            try:
                status, response = insert_request.next_chunk()
                if status:
                    progress = int(status.progress() * 100)
                    logger.info(f"📊 Upload progress: {progress}%")
                    
            except HttpError as e:
                if e.resp.status in [500, 502, 503, 504]:
                    error = f"A retriable HTTP error {e.resp.status} occurred:\n{e.content}"
                else:
                    raise
                    
            except Exception as e:
                error = f"An error occurred: {e}"
                
            if error is not None:
                logger.warning(f"⚠️ {error}")
                retry += 1
                if retry > 3:
                    logger.error("❌ Maximum retries exceeded")
                    return None
                    
                max_sleep = 2 ** retry
                sleep_seconds = max_sleep
                logger.info(f"⏳ Retrying in {sleep_seconds} seconds...")
                time.sleep(sleep_seconds)
                error = None
        
        if 'id' in response:
            return response['id']
        else:
            logger.error(f"❌ Upload failed: {response}")
            return None
    
    def _add_to_playlist(self, video_id, video_key):
        """Add video to existing playlist"""
        try:
            playlist_item_body = {
                'snippet': {
                    'playlistId': self.playlist_id,
                    'resourceId': {
                        'kind': 'youtube#video',
                        'videoId': video_id
                    }
                }
            }
            
            self.youtube.playlistItems().insert(
                part='snippet',
                body=playlist_item_body
            ).execute()
            
            logger.info(f"✅ Added {video_key} to playlist")
            
        except HttpError as e:
            logger.error(f"❌ Error adding {video_key} to playlist: {e}")
    
    def upload_remaining_videos(self):
        """Upload only the remaining videos"""
        remaining_files = find_remaining_videos()
        
        if not remaining_files:
            logger.info("🎉 All videos have already been uploaded!")
            return True
        
        logger.info(f"📹 Found {len(remaining_files)} videos to upload")
        logger.info(f"🎯 Using existing playlist: {self.playlist_id}")
        
        # Upload videos in order
        uploaded_videos = {}
        upload_order = sorted(remaining_files.keys())
        
        for video_key in upload_order:
            result = self.upload_video(video_key, remaining_files[video_key])
            
            if result == "LIMIT_EXCEEDED":
                logger.error("🚫 Daily upload limit reached!")
                logger.info(f"📋 Resume from video {video_key} tomorrow")
                break
            elif result:
                uploaded_videos[video_key] = result
            else:
                logger.error(f"❌ Failed to upload {video_key}")
        
        # Update results file
        self._update_results(uploaded_videos)
        
        # Summary
        logger.info("🎉 Upload Summary:")
        logger.info(f"✅ Successfully uploaded: {len(uploaded_videos)} videos")
        logger.info(f"📋 Playlist ID: {self.playlist_id}")
        logger.info(f"🔗 Playlist URL: https://youtube.com/playlist?list={self.playlist_id}")
        
        return len(uploaded_videos) > 0
    
    def _update_results(self, new_uploads):
        """Update the results file with new uploads"""
        try:
            # Load existing results
            results = {}
            if os.path.exists('upload_results.json'):
                with open('upload_results.json', 'r') as f:
                    results = json.load(f)
            
            # Update with new uploads
            if 'uploaded_videos' not in results:
                results['uploaded_videos'] = {}
            
            results['uploaded_videos'].update(new_uploads)
            results['playlist_id'] = self.playlist_id
            results['playlist_url'] = f"https://youtube.com/playlist?list={self.playlist_id}"
            results['last_update'] = time.strftime('%Y-%m-%d %H:%M:%S')
            
            # Save updated results
            with open('upload_results.json', 'w') as f:
                json.dump(results, f, indent=2)
            
            logger.info("💾 Results updated in upload_results.json")
            
        except Exception as e:
            logger.error(f"❌ Error updating results: {e}")

def main():
    """Main execution function"""
    print("🔄 SecurGeek YouTube Resume Uploader")
    print("=" * 50)
    
    # Check if video folder exists
    if not os.path.exists(VIDEO_FOLDER):
        print(f"❌ Error: Video folder not found!")
        print(f"📁 Expected location: {VIDEO_FOLDER}")
        return False
    
    # Initialize uploader
    uploader = YouTubeResumeUploader()
    
    # Authenticate
    if not uploader.authenticate():
        print("❌ Authentication failed!")
        return False
    
    # Check what needs to be uploaded
    remaining = find_remaining_videos()
    uploaded = load_uploaded_videos()
    
    print(f"\n📊 Upload Status:")
    print(f"✅ Already uploaded: {len(uploaded)} videos")
    print(f"📹 Remaining to upload: {len(remaining)} videos")
    print(f"🎯 Target playlist: {EXISTING_PLAYLIST_ID}")
    
    if not remaining:
        print("\n🎉 All videos have been uploaded!")
        print(f"🔗 View playlist: https://youtube.com/playlist?list={EXISTING_PLAYLIST_ID}")
        return True
    
    print("\n📋 Videos to upload:")
    for video_key in sorted(remaining.keys()):
        print(f"   📹 {video_key}: {COURSE_VIDEOS[video_key]['title']}")
    
    confirm = input("\n❓ Continue with upload? (y/N): ").lower().strip()
    if confirm != 'y':
        print("❌ Upload cancelled by user")
        return False
    
    # Start upload process
    print("\n🚀 Starting resume upload process...")
    success = uploader.upload_remaining_videos()
    
    if success:
        print("\n🎉 Resume upload completed!")
        print("📋 Check upload_results.json for video IDs")
        print(f"🔗 Videos are in your playlist: https://youtube.com/playlist?list={EXISTING_PLAYLIST_ID}")
    else:
        print("\n❌ Resume upload failed!")
        print("📋 Check the logs above for error details")
    
    return success

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Upload cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        logger.exception("Full error details:") 