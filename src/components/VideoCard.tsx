import type { VideoItem } from '../types';

interface Props {
  video: VideoItem;
  subCategoryName: string;
  onClick: () => void;
}

export default function VideoCard({ video, subCategoryName, onClick }: Props) {
  return (
    <div 
      onClick={onClick}
      className="bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors shadow-lg border border-slate-700/50 flex flex-col"
    >
      <div className="relative aspect-video w-full">
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
      
      <div className="p-3 text-left flex flex-col justify-between flex-1">
        <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-2">
          {video.title}
        </h3>
        
        {/* चैनल और कैटेगरी एक साथ (हॉरिजॉन्टल) */}
        <div className="flex items-center justify-between mt-auto gap-2">
          {/* चैनल का नाम (अगर उपलब्ध है) */}
          <div className="flex items-center gap-1.5 overflow-hidden w-3/5">
            {/* YouTube Icon */}
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4s-6.254,0-7.814,0.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/>
            </svg>
            <span className="text-slate-400 text-xs truncate">
              {video.channelName || 'Unknown'}
            </span>
          </div>

          {/* सब-कैटेगरी का बैज */}
          <span className="inline-block bg-slate-900/80 border border-slate-600 text-slate-300 text-[10px] px-2 py-0.5 rounded-full truncate max-w-[40%]">
            {subCategoryName}
          </span>
        </div>
      </div>
    </div>
  );
}