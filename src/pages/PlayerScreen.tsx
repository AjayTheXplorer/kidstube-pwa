import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function PlayerScreen() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const videoTitle = searchParams.get('title') || 'वीडियो चल रहा है...';

  // असली फुलस्क्रीन और लैंडस्केप का लॉजिक
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        // 1. पूरे डॉक्यूमेंट को फुलस्क्रीन करें
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        // 2. फिर उसे लैंडस्केप (horizontal) करें
        if (window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape');
        }
      } catch (error) {
        console.log("फुलस्क्रीन या रोटेशन ब्राउज़र द्वारा ब्लॉक है:", error);
      }
    };
    
    enterFullscreen();

    // जब यूज़र बैक जाए, तो फुलस्क्रीन से बाहर आ जाएं
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

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      
      {/* 
        यह अदृश्य परत (Overlay) सबसे ज़रूरी है। 
        यह iframe के ऊपर रहेगी (z-10), ताकि जब हम स्क्रीन पर क्लिक करें, 
        तो क्लिक हमारी इस परत पर लगे, YouTube के कंट्रोल्स पर नहीं।
        अभी हम सिर्फ क्लिक को टेस्ट कर रहे हैं, इसलिए इसे पारदर्शी (transparent) रखा है।
      */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={() => {
          alert("स्क्रीन पर क्लिक हुआ! अगले स्टेप में यहाँ वीडियो छोटा होगा।");
        }}
      ></div>

      {/* वीडियो प्लेयर - यह पूरी स्क्रीन कवर करेगा */}
      <iframe
        className="w-full h-full pointer-events-none"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      ></iframe>

      {/* बैक बटन (ताकि वीडियो से बाहर निकल सकें) */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
    </div>
  );
}