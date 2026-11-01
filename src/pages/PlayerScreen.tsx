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

  // वीडियो फुल स्क्रीन में है या छोटा (minimized) है
  const [isMinimized, setIsMinimized] = useState(false);

  // सजेशन वीडियो लोड करने के लिए हुक
  const { videos } = useVideos(category);
  // जो वीडियो अभी चल रहा है, उसे सजेशन लिस्ट से हटा दें
  const suggestedVideos = videos.filter(v => v.videoId !== videoId);

  // स्क्रीन रोटेशन और फुलस्क्रीन का लॉजिक
  useEffect(() => {
    const enterFullscreenAndRotate = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
        if (window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape');
        }
      } catch (error) {
        console.log("ऑटो-रोटेशन ब्लॉक है:", error);
      }
    };

    enterFullscreenAndRotate();

    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    };
  }, []);

  if (!videoId || videoId === 'undefined') return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&fs=1`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col overflow-hidden text-white">
      
      {/* 
        वीडियो कंटेनर:
        अगर फुल स्क्रीन है, तो पूरी स्क्रीन लेगा। 
        अगर छोटा है, तो ऊपर 1/3 हिस्सा लेगा (या 16:9 रेशियो)।
      */}
      <div 
        className={`relative w-full bg-black transition-all duration-300 ${
          isMinimized ? 'aspect-video flex-none' : 'flex-1'
        }`}
      >
        {/* YouTube iframe (अब इसमें pointer-events-none नहीं है, ताकि कंट्रोल्स काम करें) */}
        <iframe
          className="absolute top-0 left-0 w-full h-full border-none"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>

        {/* बैक बटन (ऊपर बाईं ओर) */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 p-2 bg-black/60 hover:bg-black/90 rounded-full text-white z-20 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* मिनिमाइज़ / एक्सपैंड बटन (नीचे दाईं ओर) */}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/90 rounded-full text-white z-20 backdrop-blur-sm"
        >
          {isMinimized ? (
            // एक्सपैंड आइकन (ऊपर तीर)
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            // मिनिमाइज़ आइकन (नीचे तीर)
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* सजेशन लिस्ट (यह सिर्फ तब दिखेगी जब वीडियो मिनिमाइज़ होगा) */}
      {isMinimized && (
        <div className="flex-1 overflow-y-auto bg-slate-900 p-4 border-t border-slate-700">
          <h2 className="text-lg font-bold text-slate-300 mb-3">आगे देखें (Watch Next)</h2>
          
          <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide">
            {suggestedVideos.length > 0 ? (
              suggestedVideos.map((video) => (
                <div key={video.id} className="min-w-[200px] max-w-[220px]">
                  <VideoCard 
                    video={video} 
                    onClick={() => {
                      // नया वीडियो चुनने पर वापस फुल स्क्रीन में जाएं
                      setIsMinimized(false);
                      navigate(`/play/${video.videoId}?title=${encodeURIComponent(video.title)}&category=${encodeURIComponent(video.category)}`);
                    }} 
                  />
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">इस श्रेणी में अभी और वीडियो नहीं हैं।</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}