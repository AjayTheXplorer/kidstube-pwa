import type { VideoItem } from '../types';

interface Props {
  video: VideoItem;
  subCategoryName: string; // नया प्रॉप: सब-कैटेगरी का नाम
  onClick: () => void;
}

export default function VideoCard({ video, subCategoryName, onClick }: Props) {
  return (
    <div 
      onClick={onClick}
      className="bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors shadow-lg border border-slate-700/50"
    >
      <div className="relative aspect-video">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-4 text-left"> {/* यहाँ text-left जोड़ा गया है */}
        <h3 className="text-white font-semibold line-clamp-2 leading-tight mb-2">
          {video.title}
        </h3>
        
        {/* सब-कैटेगरी का छोटा सा बैज */}
        <div className="inline-block bg-slate-900/80 border border-slate-600 text-slate-300 text-xs px-2 py-1 rounded-full">
          {subCategoryName}
        </div>
      </div>
    </div>
  );
}