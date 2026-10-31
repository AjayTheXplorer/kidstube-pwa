import { useParams, useNavigate } from 'react-router-dom';

export default function PlayerScreen() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  if (!videoId) return null;

  // YouTube iframe URL - इसमें ऑटोप्ले और रिलेटेड वीडियो बंद करने के पैरामीटर हैं
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* हेडर */}
      <header className="bg-blue-900 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button 
          onClick={() => navigate(-1)} 
          className="text-white hover:text-blue-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">वीडियो चल रहा है...</h1>
      </header>

      {/* वीडियो प्लेयर - सीधा iframe */}
      <div className="w-full bg-black relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      {/* नीचे का हिस्सा */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-300">
          अब आप सुरक्षित रूप से वीडियो देख रहे हैं।
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          ध्यान दें: वीडियो के नीचे दाईं ओर YouTube का लोगो है, अगर आप उस पर क्लिक करेंगे तो आप YouTube पर चले जाएंगे।
        </p>
      </div>
    </div>
  );
}