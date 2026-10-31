import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function PlayerScreen() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const videoTitle = searchParams.get('title') || 'वीडियो चल रहा है...';

  // अगर URL में videoId नहीं है या वह 'undefined' है, तो होम पर वापस भेजें
  useEffect(() => {
    if (!videoId || videoId === 'undefined') {
      navigate('/');
    }
  }, [videoId, navigate]);

  if (!videoId || videoId === 'undefined') return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="bg-blue-900 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button 
          onClick={() => navigate(-1)} 
          className="text-white hover:text-blue-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        {/* यहाँ अब वीडियो का असली टाइटल दिखेगा */}
        <h1 className="text-xl font-bold line-clamp-1">{decodeURIComponent(videoTitle)}</h1>
      </header>

      <div className="w-full bg-black relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>

      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-300">
          अब आप सुरक्षित रूप से वीडियो देख रहे हैं।
        </h2>
      </div>
    </div>
  );
}