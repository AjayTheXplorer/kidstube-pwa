import { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useVideos } from '../hooks/useVideos';
import CategoryTabs from '../components/CategoryTabs';
import VideoCard from '../components/VideoCard';

export default function HomeScreen() {
  const { categories, defaultCategory, loading: catLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // जब डिफ़ॉल्ट कैटेगरी लोड हो जाए, तो उसे सेलेक्ट कर लें
  useEffect(() => {
    if (defaultCategory && !selectedCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory, selectedCategory]);

  const { videos, loading: vidLoading } = useVideos(selectedCategory);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-10">
      {/* हेडर */}
      <header className="bg-blue-900 p-4 sticky top-0 z-10 shadow-md flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">KidsTube</h1>
      </header>

      {/* कैटेगरी टैब्स */}
      {!catLoading && (
        <CategoryTabs 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
      )}

      {/* वीडियो ग्रिड */}
      <main className="p-4 max-w-7xl mx-auto">
        {vidLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">इस श्रेणी में अभी कोई वीडियो नहीं है।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}