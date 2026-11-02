import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useVideos } from '../hooks/useVideos';

export default function PlayerScreen() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL से categoryId पढ़ें
  const categoryId = searchParams.get('categoryId') || '';

  const [isMinimized, setIsMinimized] = useState(false);

  // सिर्फ इसी सब-कैटेगरी के वीडियो लाएं
  const { videos } = useVideos(categoryId ? [categoryId] : []);
  const suggestedVideos = videos.filter(v => v.videoId !== videoId);

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
    <div className="fixed top-0 left-0 w-full h-dvh z-50 bg-black flex flex-col overflow-hidden text-white">
      
      <div className="relative w-full flex-1 transition-all duration-300 ease-in-out bg-black">
        <iframe
          className="absolute top-0 left-0 w-full h-full border-none"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>

        <div className="absolute bottom-0 left-0 right-0 h-6 z-10 pointer-events-auto cursor-default"></div>
        <div className="absolute bottom-0 right-0 w-48 h-20 z-10 pointer-events-auto cursor-default"></div>

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

        <div className="absolute bottom-2 right-2 z-20">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-3 bg-black/80 hover:bg-black/90 border-2 border-yellow-400 text-yellow-400 rounded-xl transition-all shadow-[0_0_15px_rgba(250,204,21,0.6)]"
          >
            {isMinimized ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div 
        className={`w-full bg-slate-900 transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          isMinimized ? 'h-20 opacity-100' : 'h-0 opacity-0'
        }`}
      >
        <div className="flex overflow-x-auto gap-3 px-4 h-full items-center scrollbar-hide relative z-30">
          {suggestedVideos.length > 0 ? (
            suggestedVideos.map((video) => (
              <div 
                key={video.id} 
                className="shrink-0 h-16 aspect-video cursor-pointer rounded-lg overflow-hidden shadow-md border border-slate-700/50"
                onClick={() => {
                  setIsMinimized(false); 
                  // यहाँ गलती थी: ?category= की जगह ?categoryId= होना चाहिए
                  navigate(`/play/${video.videoId}?categoryId=${encodeURIComponent(video.categoryId)}`, { replace: true });
                }}
              >
                <img 
                  src={video.thumbnailUrl} 
                  alt="thumbnail"
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