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

  // शुरुआत में लिस्ट दिखेगी (isMinimized = true)
  const [isMinimized, setIsMinimized] = useState(true);

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
      
      {/* 
        वीडियो सेक्शन: 
        अगर isMinimized true है (लिस्ट खुली है), तो यह 50% जगह लेगा।
        अगर false है, तो पूरी स्क्रीन (flex-1) लेगा।
      */}
      <div 
        className={`relative w-full transition-all duration-300 ease-in-out bg-black ${
          isMinimized ? 'h-[50vh]' : 'flex-1'
        }`}
      >
        {/* YouTube iframe - इसमें कोई ओवरले नहीं है, कंट्रोल्स पूरी तरह काम करेंगे */}
        <iframe
          className="absolute top-0 left-0 w-full h-full border-none"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>

        {/* टॉप बार: बैक बटन, टाइटल और स्क्रीन टॉगल (Expand/Minimize) बटन */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20 pointer-events-none">
          
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* बैक बटन */}
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-black/60 hover:bg-black/90 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <h1 className="text-white font-semibold text-lg drop-shadow-md truncate max-w-[50vw]">
              {decodeURIComponent(videoTitle)}
            </h1>
          </div>

          {/* फुल स्क्रीन / मिनिमाइज़ (Expand / Hide List) बटन */}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 bg-black/60 hover:bg-black/90 rounded-full pointer-events-auto"
          >
            {isMinimized ? (
              // एक्सपैंड (ऊपर-नीचे तीर) आइकन
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              // मिनिमाइज़ (लिस्ट दिखाने) आइकन
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* सजेशन लिस्ट सेक्शन - यह सिर्फ तब दिखेगा जब isMinimized true हो */}
      <div 
        className={`w-full bg-slate-900 overflow-y-auto transition-all duration-300 ease-in-out ${
          isMinimized ? 'flex-1 opacity-100' : 'h-0 opacity-0 hidden'
        }`}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold text-slate-300 mb-3">आगे देखें (Watch Next)</h2>
          
          {/* हॉरिजॉन्टल स्क्रॉलर */}
          <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide">
            {suggestedVideos.length > 0 ? (
              suggestedVideos.map((video) => (
                <div key={video.id} className="min-w-[200px] max-w-[220px]">
                  <VideoCard 
                    video={video} 
                    onClick={() => {
                      // नया वीडियो चुनने पर फिर से फुल स्क्रीन में जाएं
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
      </div>

    </div>
  );
}