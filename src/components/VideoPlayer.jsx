import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

const VideoPlayer = ({ videoUrl, title }) => {
  const [error, setError] = useState(null)
  const [isYouTube, setIsYouTube] = useState(false)
  const [videoId, setVideoId] = useState(null)

  // Extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  useEffect(() => {
    if (videoUrl) {
      const id = getYouTubeVideoId(videoUrl)
      if (id) {
        setIsYouTube(true)
        setVideoId(id)
      } else {
        setIsYouTube(false)
        setVideoId(null)
      }
    }
  }, [videoUrl])

  if (error) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg mb-2">Video Unavailable</p>
          <p className="text-sm text-gray-300">{error}</p>
          <button 
            onClick={() => window.open(videoUrl, '_blank')}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Watch on YouTube
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-black group">
      {isYouTube && videoId ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'YouTube video player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      ) : videoUrl ? (
        <video
          src={videoUrl}
          className="w-full h-full"
          controls
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <p>No video available</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer