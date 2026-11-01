import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function PlayerScreen() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // टाइटल को यहाँ यूज़ करेंगे ताकि बैक बटन के साथ यह भी दिखे
  const videoTitle = searchParams.get('title') || 'वीडियो चल रहा है...';

  // ब्राउज़र को फुलस्क्रीन और लैंडस्केप करने का लॉजिक
  useEffect(() => {
    const enterFullscreenAndRotate = async () => {
      try {
        // 1. पेज को फुलस्क्रीन करें (URL बार छिपाने के लिए)
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
        // 2. स्क्रीन को लैंडस्केप करें
        if (window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape');
        }
      } catch (error) {
        console.log("ऑटो-रोटेशन या फुलस्क्रीन ब्राउज़र द्वारा ब्लॉक है:", error);
      }
    };

    enterFullscreenAndRotate();

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

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&fs=1`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      
      {/* 
        अदृश्य परत (Invisible Overlay): 
        यह YouTube के iframe के ऊपर है ताकि हम क्लिक को पकड़ सकें।
      */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={() => {
          // अभी के लिए हम सिर्फ कंसोल में प्रिंट करेंगे, अगले स्टेप में इसे मिनिमाइज़ करेंगे
          console.log("स्क्रीन पर क्लिक हुआ!");
        }}
      ></div>

      {/* वीडियो प्लेयर */}
      <iframe
        className="w-full h-full pointer-events-none"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      ></iframe>

      {/* 
        हेडर (बैक बटन और टाइटल): 
        pointer-events-none का मतलब है कि यह पूरे हेडर पर क्लिक ब्लॉक नहीं करेगा, 
        लेकिन बटन पर pointer-events-auto लगा है ताकि सिर्फ बटन क्लिक हो।
      */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center gap-4 pointer-events-none">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); // ताकि क्लिक ओवरले तक न जाए
            navigate(-1); 
          }} 
          className="p-2 bg-black/50 hover:bg-black/80 rounded-full text-white pointer-events-auto cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        {/* टाइटल का इस्तेमाल यहाँ किया गया है */}
        <h1 className="text-white font-semibold text-lg drop-shadow-md truncate">
          {decodeURIComponent(videoTitle)}
        </h1>
      </div>

    </div>
  );
}