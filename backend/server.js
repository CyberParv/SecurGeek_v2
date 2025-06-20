const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your production domain
    : ['http://localhost:5173', 'http://localhost:3000'], // Development origins
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get video information and stream URL
app.get('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Validate video ID format
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ 
        error: 'Invalid video ID format' 
      });
    }

    console.log(`Fetching video info for: ${videoId}`);
    
    // Check if video exists and is accessible
    if (!await ytdl.validateURL(`https://www.youtube.com/watch?v=${videoId}`)) {
      return res.status(404).json({ 
        error: 'Video not found or not accessible' 
      });
    }

    // Get video information
    const info = await ytdl.getInfo(videoId);
    
    // Filter formats to get the best quality video with audio
    const formats = info.formats.filter(format => 
      format.hasVideo && 
      format.hasAudio && 
      format.container === 'mp4'
    );

    if (formats.length === 0) {
      return res.status(404).json({ 
        error: 'No suitable video format found' 
      });
    }

    // Choose the best quality format
    const format = ytdl.chooseFormat(formats, { 
      quality: 'highest',
      filter: 'videoandaudio'
    });

    // Extract video details
    const videoDetails = {
      url: format.url,
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails?.[0]?.url,
      author: info.videoDetails.author?.name,
      viewCount: parseInt(info.videoDetails.viewCount),
      uploadDate: info.videoDetails.uploadDate,
      quality: format.qualityLabel,
      container: format.container,
      contentLength: format.contentLength
    };

    console.log(`Successfully fetched video: ${videoDetails.title}`);
    
    res.json(videoDetails);

  } catch (error) {
    console.error('Error fetching video:', error);
    
    // Handle specific YouTube errors
    if (error.message.includes('Video unavailable')) {
      return res.status(404).json({ 
        error: 'Video is unavailable or private' 
      });
    }
    
    if (error.message.includes('age-restricted')) {
      return res.status(403).json({ 
        error: 'Video is age-restricted and cannot be accessed' 
      });
    }

    if (error.message.includes('private')) {
      return res.status(403).json({ 
        error: 'Video is private and cannot be accessed' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch video information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get video stream directly (alternative endpoint)
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { quality = 'highest' } = req.query;
    
    // Validate video ID
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ 
        error: 'Invalid video ID format' 
      });
    }

    console.log(`Streaming video: ${videoId} with quality: ${quality}`);

    // Create video stream
    const stream = ytdl(videoId, {
      quality: quality,
      filter: 'videoandaudio'
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Handle stream errors
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error occurred' });
      }
    });

    // Pipe the stream to response
    stream.pipe(res);

  } catch (error) {
    console.error('Error streaming video:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to stream video',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Video backend server running on port ${PORT}`);
  console.log(`📺 Video API available at http://localhost:${PORT}/api/video/:videoId`);
  console.log(`🎬 Stream API available at http://localhost:${PORT}/api/stream/:videoId`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});