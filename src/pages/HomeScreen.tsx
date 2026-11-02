import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useVideos } from '../hooks/useVideos';
import CategoryTabs from '../components/CategoryTabs';
import VideoCard from '../components/VideoCard';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories, loading: loadingCats } = useCategories(); 
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryIdsToFetch, setCategoryIdsToFetch] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const rootCategories = categories.filter(c => !c.parentId);

  // URL से categoryId पढ़ें
  const urlCategoryId = searchParams.get('categoryId');

  useEffect(() => {
    if (urlCategoryId) {
      setSelectedCategoryId(urlCategoryId);
    } else if (!selectedCategoryId && rootCategories.length > 0) {
      setSelectedCategoryId(rootCategories[0].id);
    }
  }, [rootCategories, selectedCategoryId, urlCategoryId]);

  useEffect(() => {
    if (!selectedCategoryId || categories.length === 0) return;

    const idsToFetch = [selectedCategoryId];
    const findChildren = (parentId: string) => {
      const children = categories.filter(c => c.parentId === parentId);
      children.forEach(child => {
        idsToFetch.push(child.id);
        findChildren(child.id);
      });
    };
    findChildren(selectedCategoryId);
    setCategoryIdsToFetch(idsToFetch);
  }, [selectedCategoryId, categories]);

  const { videos } = useVideos(categoryIdsToFetch);

  const getSubCategoryName = (categoryId: string): string => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : '';
  };

  // सर्च फ़िल्टर लॉजिक
  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getSubCategoryName(v.categoryId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-10">
      {/* सर्च बार */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="relative">
          <input 
            type="text" 
            placeholder="वीडियो या कैटेगरी सर्च करें..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* कैटेगरी टैब्स (सिर्फ तब दिखाएं जब सर्च बार खाली हो) */}
      {!loadingCats && rootCategories.length > 0 && !searchQuery && (
        <CategoryTabs 
          categories={rootCategories} 
          selectedCategory={selectedCategoryId} 
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            navigate(`/?categoryId=${id}`, { replace: true }); // URL अपडेट करें
          }} 
        />
      )}
      
      <div className="p-4 max-w-7xl mx-auto">
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVideos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                subCategoryName={getSubCategoryName(video.categoryId)}
                onClick={() => navigate(`/play/${video.videoId}?title=${encodeURIComponent(video.title)}&categoryId=${video.categoryId}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            {searchQuery ? 'आपकी सर्च से कोई वीडियो नहीं मिला।' : 'इस कैटेगरी में कोई वीडियो नहीं है।'}
          </div>
        )}
      </div>
    </div>
  );
}