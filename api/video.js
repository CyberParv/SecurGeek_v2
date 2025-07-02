import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;
    
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
      error: 'Failed to fetch video information'
    });
  }
} 