import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useVideos } from '../hooks/useVideos';
import VideoCard from '../components/VideoCard';

export default function PlayerScreen() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const videoTitle = searchParams.get('title') || 'वीडियो चल रहा है...';
  const category = searchParams.get('category') || 'Sanskrit';

  // वीडियो फुल स्क्रीन में है या मिनिमाइज़्ड (छोटा) है
  const [isMinimized, setIsMinimized] = useState(false);
  
  const { videos } = useVideos(category);
  const suggestedVideos = videos.filter(v => v.videoId !== videoId);

  // स्क्रीन लैंडस्केप करने की कोशिश
  useEffect(() => {
    const tryLockOrientation = async () => {
      try {
        if (window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape');
        }
      } catch (error) {
        console.log("ऑटो-रोटेशन सपोर्टेड नहीं है:", error);
      }
    };
    tryLockOrientation();
    return () => {
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    };
  }, []);

  if (!videoId || videoId === 'undefined') return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  // --- फुल स्क्रीन व्यू (जब वीडियो बड़ा हो) ---
  if (!isMinimized) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black flex flex-col cursor-pointer" 
        onClick={() => setIsMinimized(true)}
      >
        {/* वीडियो को पूरी स्क्रीन पर फैलाने के लिए w-full h-full */}
        <iframe
          className="w-full h-full border-none"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        
        {/* ऊपर बैक बटन (ताकि बाहर निकल सकें) */}
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(-1); }} 
          className="absolute top-4 left-4 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white z-50 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* संकेत कि नीचे देखने के लिए क्लिक करें */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
          सुझाव देखने के लिए स्क्रीन पर क्लिक करें 👇
        </div>
      </div>
    );
  }

  // --- मिनिमाइज़्ड व्यू (वीडियो छोटा होकर ऊपर, लिस्ट नीचे) ---
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      
      {/* वीडियो प्लेयर (छोटा) - फिक्स्ड रेशियो के साथ */}
      <div 
        className="w-full bg-black relative cursor-pointer aspect-video" 
        onClick={() => setIsMinimized(false)}
      >
        <iframe
          className="absolute top-0 left-0 w-full h-full border-none"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        
        {/* बैक बटन */}
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(-1); }} 
          className="absolute top-2 left-2 p-2 bg-black/60 rounded-full text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      {/* नीचे का हिस्सा (सजेशन लिस्ट) */}
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-lg font-bold text-white mb-1 line-clamp-1">
          {decodeURIComponent(videoTitle)}
        </h1>
        <p className="text-sm text-slate-400 mb-4">श्रेणी: {category}</p>

        <h2 className="text-md font-bold text-slate-300 mb-3 border-t border-slate-700 pt-4">
          आगे देखें (Watch Next)
        </h2>
        
        {/* सजेशन कार्ड्स हॉरिजॉन्टल स्क्रॉलर */}
        <div className="flex overflow-x-auto gap-3 pb-6 scrollbar-hide">
          {suggestedVideos.map((video) => (
            <div key={video.id} className="min-w-[200px] max-w-[220px]">
              <VideoCard 
                video={video} 
                onClick={() => {
                  setIsMinimized(false); // नया वीडियो चुनने पर फिर से फुल स्क्रीन
                  navigate(`/play/${video.videoId}?title=${encodeURIComponent(video.title)}&category=${encodeURIComponent(video.category)}`);
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}