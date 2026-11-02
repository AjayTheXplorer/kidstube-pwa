import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useVideos } from '../hooks/useVideos';
import { subscribeToDefaultCategory } from '../services/firestoreService';
import CategoryTabs from '../components/CategoryTabs';
import VideoCard from '../components/VideoCard';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories, loading: loadingCats } = useCategories(); 
  
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');

  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category')!);
    } else if (!selectedCategory) {
      const unsub = subscribeToDefaultCategory((def) => setSelectedCategory(def));
      return () => unsub();
    }
  }, [searchParams, selectedCategory]);

  const { videos } = useVideos(selectedCategory);

  return (
    <div className="pb-10">
      {!loadingCats && (
        <CategoryTabs 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
      )}
      
      <div className="p-4 max-w-7xl mx-auto">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                onClick={() => navigate(`/play/${video.videoId}?title=${encodeURIComponent(video.title)}&category=${encodeURIComponent(video.category)}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">इस कैटेगरी में कोई वीडियो नहीं है।</div>
        )}
      </div>
    </div>
  );
}