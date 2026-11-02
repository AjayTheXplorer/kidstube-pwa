import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

export default function CategoriesScreen() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  
  // null = मुख्य कैटेगरी, वरना उस कैटेगरी की ID जिसके अंदर हम हैं
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // जो कैटेगरीज़ अभी स्क्रीन पर दिखनी चाहिए
  const displayedCategories = categories.filter(c => c.parentId === currentParentId);

  // चेक करें कि किसी कैटेगरी के अंदर सब-कैटेगरी हैं या नहीं
  const hasSubCategories = (id: string) => categories.some(c => c.parentId === id);

  const handleCategoryClick = (catId: string) => {
    if (hasSubCategories(catId)) {
      // अगर सब-कैटेगरी हैं, तो उसके अंदर जाएं
      setCurrentParentId(catId);
    } else {
      // अगर सब-कैटेगरी नहीं हैं, तो सीधे होम स्क्रीन पर उस कैटेगरी के वीडियो दिखाएं
      navigate(`/?categoryId=${catId}`);
    }
  };

  const handleBack = () => {
    if (!currentParentId) return;
    const currentCat = categories.find(c => c.id === currentParentId);
    setCurrentParentId(currentCat?.parentId || null);
  };

  const currentCategoryName = currentParentId 
    ? categories.find(c => c.id === currentParentId)?.name 
    : 'सभी कैटेगरीज़';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        {currentParentId && (
          <button onClick={handleBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        )}
        <h2 className="text-2xl font-bold">{currentCategoryName}</h2>
      </div>

      {displayedCategories.length === 0 ? (
        <div className="text-center py-20 text-slate-500">कोई कैटेगरी नहीं मिली।</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayedCategories.map(cat => {
            const isParent = hasSubCategories(cat.id);
            return (
              <div 
                key={cat.id} 
                onClick={() => handleCategoryClick(cat.id)}
                className="bg-slate-800 p-6 rounded-xl text-center cursor-pointer hover:bg-slate-700 shadow-lg border border-slate-700/50 transition-transform hover:scale-105"
              >
                <div className="text-4xl mb-3">{isParent ? '📁' : '📄'}</div>
                <h3 className="font-bold text-lg mb-2">{cat.name}</h3>
                {!isParent && (
                  <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full mt-2">
                    वीडियो देखें
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}