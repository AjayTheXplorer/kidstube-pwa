import { useNavigate } from 'react-router-dom';
import type { VideoItem } from '../types';

interface Props {
  video: VideoItem;
}

export default function VideoCard({ video }: Props) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/play/${video.videoId}`)}
      className="bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors shadow-lg"
    >
      <div className="relative aspect-video">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover"
        />
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold line-clamp-2 leading-tight">
          {video.title}
        </h3>
        <p className="text-slate-400 text-sm mt-1">{video.category}</p>
      </div>
    </div>
  );
}