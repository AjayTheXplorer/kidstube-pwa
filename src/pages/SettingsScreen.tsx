import { useState, useEffect, useRef } from 'react';
import { useCategories } from '../hooks/useCategories';
import { setDefaultCategoryInDb, subscribeToDefaultCategory } from '../services/firestoreService';

export default function SettingsScreen() {
  const { categories } = useCategories();
  const [defaultCat, setDefaultCat] = useState('');
  
  // कस्टम ड्रॉपडाउन के लिए स्टेट
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToDefaultCategory(setDefaultCat);
    return () => unsub();
  }, []);

  // बाहर क्लिक करने पर ड्रॉपडाउन बंद करने का लॉजिक
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultCat) return;
    await setDefaultCategoryInDb(defaultCat);
    alert('डिफ़ॉल्ट कैटेगरी सेव हो गई!');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-8">सेटिंग्स</h2>

      <div className="bg-slate-800 p-6 rounded-xl max-w-md">
        <h3 className="text-xl font-bold mb-2">डिफ़ॉल्ट कैटेगरी</h3>
        <p className="text-sm text-slate-400 mb-6">ऐप खुलने पर यह कैटेगरी सबसे पहले दिखेगी।</p>
        
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* कस्टम ड्रॉपडाउन */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex justify-between items-center p-3 bg-slate-700 rounded-lg outline-none text-left"
            >
              <span>{defaultCat || '-- कैटेगरी चुनें --'}</span>
              <svg className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* ड्रॉपडाउन लिस्ट */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                {categories.length > 0 ? (
                  categories.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setDefaultCat(c.name);
                        setIsDropdownOpen(false);
                      }}
                      className={`p-3 cursor-pointer hover:bg-slate-600 transition-colors ${defaultCat === c.name ? 'bg-slate-600 text-blue-400 font-bold' : ''}`}
                    >
                      {c.name}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400 text-sm">कोई कैटेगरी नहीं मिली</div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-500 mt-2">
            सेव करें
          </button>
        </form>
      </div>
    </div>
  );
}