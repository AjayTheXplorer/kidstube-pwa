import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useVideos } from '../hooks/useVideos';

export default function PlayerScreen() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // const videoTitle = searchParams.get('title') || 'वीडियो चल रहा है...';
  const category = searchParams.get('category') || 'Sanskrit';

  // शुरुआत में वीडियो फुल स्क्रीन में रहेगा (false = फुल स्क्रीन)
  const [isMinimized, setIsMinimized] = useState(false);

  const { videos } = useVideos(category);
  const suggestedVideos = videos.filter(v => v.videoId !== videoId);

  // रोटेशन और फुलस्क्रीन लॉजिक
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
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden text-white">
      
      {/* वीडियो कंटेनर */}
      <div 
        className={`relative w-full transition-all duration-300 ease-in-out bg-black ${
          isMinimized ? 'h-[70%]' : 'flex-1' // अब लिस्ट छोटी है, तो वीडियो को 70% जगह दे रहे हैं
        }`}
      >
        {/* YouTube iframe */}
        <iframe
          className="absolute top-0 left-0 w-full h-full border-none"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>

        {/* टॉप लेफ्ट: बैक बटन (पीले ग्लो के साथ) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <button 
            onClick={() => navigate('/', { replace: true })} 
            className="flex items-center gap-2 px-4 py-2.5 bg-black/80 hover:bg-black/90 border-2 border-yellow-400 rounded-xl pointer-events-auto transition-all shadow-[0_0_15px_rgba(250,204,21,0.6)] backdrop-blur-sm"
          >
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold text-sm text-white">वापस जाएं</span>
          </button>
        </div>

        {/* बॉटम राइट: लिस्ट टॉगल बटन (पीले ग्लो और 5px राइट एलाइनमेंट के साथ) */}
        <div className={`absolute right-1.25 z-20 pointer-events-none transition-all duration-300 ${isMinimized ? 'bottom-4' : 'bottom-20'}`}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-3 bg-black/80 hover:bg-black/90 border-2 border-yellow-400 text-yellow-400 rounded-xl pointer-events-auto transition-all shadow-[0_0_15px_rgba(250,204,21,0.6)]"
            title="वीडियो लिस्ट देखें"
          >
            {isMinimized ? (
              // नीचे तीर (वीडियो बड़ा करने के लिए)
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
              </svg>
            ) : (
              // हैमबर्गर मेनू (लिस्ट दिखाने के लिए)
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 
        सजेशन लिस्ट: 
        अब यह बहुत कॉम्पैक्ट है, इसमें सिर्फ थंबनेल हैं (कोई टेक्स्ट नहीं)।
      */}
      <div 
        className={`w-full bg-slate-900 transition-all duration-300 ease-in-out overflow-hidden ${
          isMinimized ? 'h-[30%] flex items-center' : 'h-0'
        }`}
      >
        <div className="flex overflow-x-auto gap-4 px-4 py-2 scrollbar-hide h-full items-center">
          {suggestedVideos.length > 0 ? (
            suggestedVideos.map((video) => (
              <div 
                key={video.id} 
                className="shrink-0 h-[85%] aspect-video cursor-pointer rounded-xl overflow-hidden shadow-lg border border-slate-700/50"
                onClick={() => {
                  setIsMinimized(false); 
                  navigate(`/play/${video.videoId}?title=${encodeURIComponent(video.title)}&category=${encodeURIComponent(video.category)}`, { replace: true });
                }}
              >
                {/* सिर्फ इमेज (थंबनेल) */}
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm px-4">इस श्रेणी में अभी और वीडियो नहीं हैं।</p>
          )}
        </div>
      </div>

    </div>
  );
}