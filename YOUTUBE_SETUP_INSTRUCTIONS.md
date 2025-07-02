# 🚀 YouTube Auto Uploader Setup Instructions

## 📋 Prerequisites

1. **Python 3.7+** installed on your system
2. **YouTube Channel** with upload permissions
3. **Google Cloud Console** access
4. **Video files** in the correct folder with proper naming

---

## ⚙️ Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 Step 2: Set Up YouTube API Credentials

### A. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "SecurGeek YouTube Uploader"

### B. Enable YouTube Data API
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "YouTube Data API v3"
3. Click on it and press **ENABLE**

### C. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - Choose **External** user type
   - Fill in app name: "SecurGeek YouTube Uploader"
   - Add your email as developer contact
   - Save and continue through all steps
4. Back to credentials, choose **Desktop application**
5. Name it "YouTube Uploader"
6. Click **CREATE**

### D. Download Credentials
1. Click the download button (⬇️) next to your OAuth client
2. Save the file as `client_secrets.json` in the same folder as the script
3. **IMPORTANT**: Keep this file secure and never share it!

---

## 📁 Step 3: Organize Your Videos

### Required Folder Structure:
```
C:\CyberSecurityCourses\Edited Videos\
├── 1.1.1.mp4  (or .avi, .mov, .mkv, .wmv, .flv, .webm)
├── 1.1.2.mp4
├── 1.2.1.mp4
├── 1.2.2.mp4
├── 1.3.1.mp4
├── 1.3.2.mp4
├── 1.4.1.mp4
├── 1.4.2.mp4
├── 1.5.1.mp4
└── 1.5.2.mp4
```

### ✅ Video Naming Requirements:
- **Exact names**: `1.1.1`, `1.1.2`, `1.2.1`, `1.2.2`, etc.
- **Supported formats**: MP4, AVI, MOV, MKV, WMV, FLV, WEBM
- **Quality**: Use highest quality available for best results

### ⚠️ Important: Update Video Definitions
The script currently includes definitions for `1.1.1`, `1.1.2`, `1.2.1`, `1.2.2` only. You need to:
1. **Add all your video definitions** to the `COURSE_VIDEOS` dictionary in `youtube_auto_uploader.py`
2. **Update the upload order** in the `upload_order` list
3. **Follow the same pattern** for titles, descriptions, and tags

---

## 🚀 Step 4: Run the Uploader

### A. Open Command Prompt/PowerShell
```bash
cd C:\SecurGeek\v2
python youtube_auto_uploader.py
```

### B. First Run Authentication
1. Script will open your browser automatically
2. Sign in to your Google account
3. Grant permissions to the app
4. Browser will show "The authentication flow has completed"
5. Return to the script - it will continue automatically

### C. Confirm Upload
- Script will show found videos and settings
- Type `y` and press Enter to confirm
- Sit back and watch the magic happen! ✨

---

## 📊 What the Script Does

### ✅ Automatic Settings Applied:
- **Visibility**: Unlisted (not searchable on YouTube)
- **Category**: Education
- **Monetization**: Enabled (if your channel qualifies)
- **Quality**: Maximum upload quality
- **Embedding**: Allowed (for your website)
- **Comments**: Disabled
- **Playlist**: Auto-created "Module 1: Understanding Cybersecurity"

### 📋 For Each Video:
1. Uploads with predefined title and description
2. Adds relevant tags for SEO
3. Sets to unlisted visibility
4. Adds to Module 1 playlist
5. Waits 10 seconds between uploads (rate limiting)

### 📄 Output Files:
- `upload_results.json` - Contains all video IDs and playlist ID
- `token.json` - Stores authentication (auto-generated)

---

## 🔧 Troubleshooting

### ❌ "Video folder not found"
- Check that the folder path exists: `C:\CyberSecurityCourses\Final audios`
- Ensure videos are named exactly: `1.1`, `1.2`, etc.

### ❌ "client_secrets.json not found"
- Download OAuth credentials from Google Cloud Console
- Save as `client_secrets.json` in script folder

### ❌ "Authentication failed"
- Delete `token.json` and run script again
- Check your Google account has YouTube access
- Ensure OAuth consent screen is configured

### ❌ "Upload failed"
- Check internet connection
- Verify video file is not corrupted
- Ensure YouTube channel has upload permissions

### ❌ "Rate limit exceeded"
- Script automatically handles this with delays
- If it persists, wait 1 hour and try again

---

## 🎯 After Upload Success

### 📋 You'll Get:
1. **Playlist ID** for the module
2. **Individual video IDs** for each lesson
3. **Direct links** to each unlisted video

### 🔗 Next Steps:
1. Copy video IDs from `upload_results.json`
2. Update your course database with YouTube URLs
3. Test embed functionality on your website
4. Verify videos are not discoverable on YouTube search

---

## 🔒 Security Notes

### ✅ Keep These Files Secure:
- `client_secrets.json` - Your API credentials
- `token.json` - Your authentication token
- `upload_results.json` - Contains your video IDs

### ⚠️ Never Share:
- OAuth client secrets
- Video IDs (if you want them private)
- API tokens

---

## 📞 Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify all prerequisites are met
3. Ensure video files are in correct format and location
4. Check Google Cloud Console for API quotas

---

## 🎉 Success!

Once complete, you'll have:
- ✅ All Module 1 videos uploaded as unlisted
- ✅ Professional titles and descriptions
- ✅ Organized in a playlist
- ✅ Ready to embed on your website
- ✅ Monetization enabled (if eligible)

**Time saved**: Hours of manual work → 10 minutes automated! 🚀 