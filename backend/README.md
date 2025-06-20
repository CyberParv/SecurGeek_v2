# SecurGeek Video Backend Service

A Node.js backend service for extracting YouTube video streams for the SecurGeek cybersecurity training platform.

## Features

- YouTube video information extraction
- Direct video stream URLs
- Rate limiting and security middleware
- CORS configuration for frontend integration
- Error handling for various YouTube restrictions
- Health check endpoint

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## API Endpoints

### GET /api/video/:videoId
Extracts video information and stream URL from YouTube.

**Parameters:**
- `videoId` - YouTube video ID (11 characters)

**Response:**
```json
{
  "url": "https://...",
  "title": "Video Title",
  "description": "Video description",
  "duration": 300,
  "thumbnail": "https://...",
  "author": "Channel Name",
  "quality": "720p",
  "container": "mp4"
}
```

### GET /api/stream/:videoId
Direct video stream endpoint.

**Parameters:**
- `videoId` - YouTube video ID
- `quality` - Video quality (optional, default: 'highest')

### GET /health
Health check endpoint.

## Usage with Frontend

Update your frontend VideoPlayer component to use this backend:

```javascript
const fetchVideoStream = async (videoId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/video/${videoId}`)
    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Error fetching video:', error)
    throw error
  }
}
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation
- Error handling

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGINS` - Allowed CORS origins

## Limitations

- Some YouTube videos may be restricted (age-restricted, private, etc.)
- Rate limits apply to prevent abuse
- Video URLs expire after some time (YouTube limitation)

## Troubleshooting

1. **Video not found**: Check if the video ID is correct and the video is publicly accessible
2. **CORS errors**: Ensure your frontend origin is added to CORS configuration
3. **Rate limiting**: Wait for the rate limit window to reset or increase limits in production

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Use a process manager like PM2
4. Set up reverse proxy with nginx
5. Enable HTTPS