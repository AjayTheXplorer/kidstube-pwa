import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { addCategoryToDb, addVideoToDb } from '../services/firestoreService';
import type { Category } from '../types';
import CustomSelect from '../components/CustomSelect';

export default function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'categories' | 'videos'>('categories');
  const { categories } = useCategories();
  const [message, setMessage] = useState('');

  // --- कैटेगरी फॉर्म स्टेट ---
  const [catName, setCatName] = useState('');
  const [parentCatId, setParentCatId] = useState('');

  // --- वीडियो अपलोड के लिए कैस्केडिंग स्टेट ---
  const [selectedPath, setSelectedPath] = useState<{ id: string; name: string }[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  // --- Bulk Upload स्टेट ---
  const [bulkUrls, setBulkUrls] = useState('');
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('गलत पासवर्ड!');
  };

  // कैटेगरी का पूरा रास्ता (Path) बनाने का फंक्शन
  const getCategoryPath = (catId: string, allCats: Category[]): string => {
    const cat = allCats.find(c => c.id === catId);
    if (!cat) return '';
    if (!cat.parentId) return cat.name;
    return `${getCategoryPath(cat.parentId, allCats)} > ${cat.name}`;
  };

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  const categoryOptions = sortedCategories.map(c => ({
    value: c.id,
    label: getCategoryPath(c.id, categories)
  }));

  // --- कैस्केडिंग ड्रॉपडाउन के लिए लॉजिक ---
  const handleCategoryChange = (level: number, catId: string) => {
    if (!catId) {
      // अगर यूज़र ने ड्रॉपडाउन खाली किया, तो उस लेवल और उसके बाद के सभी लेवल हटा दें
      setSelectedPath(prev => prev.slice(0, level));
      return;
    }
    const selectedCat = categories.find(c => c.id === catId);
    if (!selectedCat) return;

    // नया पाथ सेट करें (पिछले लेवल तक का रास्ता रखें और नया जोड़ें)
    setSelectedPath(prev => {
      const newPath = prev.slice(0, level); // level-1 तक का पाथ रखें
      newPath.push({ id: selectedCat.id, name: selectedCat.name });
      return newPath;
    });
  };

  // अगले लेवल के लिए कैटेगरीज़ ढूंढें
  const getNextLevelOptions = (level: number) => {
    const currentParentId = level === 0 ? null : selectedPath[level - 1]?.id;
    return categoryOptions.filter(opt => {
      const cat = categories.find(c => c.id === opt.value);
      return cat?.parentId === currentParentId;
    });
  };

  // --- कैटेगरी जोड़ें ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await addCategoryToDb(catName, parentCatId || null);
      setMessage('कैटेगरी सफलतापूर्वक जोड़ी गई!');
      setCatName('');
    } catch (error: any) {
      setMessage('त्रुटि: ' + error.message);
    }
  };

  // --- एकल वीडियो अपलोड ---
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentCategoryId = selectedPath[selectedPath.length - 1]?.id;
    
    if (!videoUrl || !currentCategoryId) {
      setMessage('कृपया URL और कैटेगरी (आखिरी लेवल तक) दोनों चुनें');
      return;
    }
    try {
      await addVideoToDb(videoUrl, videoTitle || 'Untitled Video', currentCategoryId);
      setMessage('वीडियो सफलतापूर्वक जोड़ा गया!');
      setVideoUrl('');
      setVideoTitle('');
    } catch (error: any) {
      setMessage('त्रुटि: ' + error.message);
    }
  };

  // --- बल्क अपलोड ---
  const handleBulkUpload = async () => {
    const currentCategoryId = selectedPath[selectedPath.length - 1]?.id;
    if (!currentCategoryId) {
      setMessage('कृपया पहले कैटेगरी चुनें');
      return;
    }
    const urls = bulkUrls.split('\n').filter(url => url.trim() !== '');
    if (urls.length === 0) return;

    setIsBulkUploading(true);
    setMessage(`${urls.length} वीडियो अपलोड हो रहे हैं...`);

    try {
      for (const url of urls) {
        await addVideoToDb(url, '', currentCategoryId);
      }
      setMessage('सभी वीडियो सफलतापूर्वक अपलोड हो गए!');
      setBulkUrls('');
    } catch (error: any) {
      setMessage('बल्क अपलोड में त्रुटि: ' + error.message);
    } finally {
      setIsBulkUploading(false);
    }
  };

  // --- ट्री व्यू रेंडर करने का फंक्शन ---
  const renderCategoryTree = (parentId: string | null = null, depth = 0) => {
    const levelCats = categories.filter(c => c.parentId === parentId);
    if (levelCats.length === 0) return null;

    return (
      <div className="flex flex-col gap-1">
        {levelCats.map(cat => (
          <div key={cat.id}>
            <div 
              className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700"
              style={{ marginLeft: `${depth * 16}px` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">{depth === 0 ? '📁' : '📄'}</span>
                <span className="font-medium text-sm">{cat.name}</span>
              </div>
              <button 
                onClick={() => { setParentCatId(cat.id); window.scrollTo(0, 0); }}
                className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-1 rounded"
              >
                + सब-कैटेगरी
              </button>
            </div>
            {renderCategoryTree(cat.id, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-white">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl shadow-lg flex flex-col gap-4 w-80">
          <h2 className="text-2xl font-bold text-center mb-2">एडमिन लॉगिन</h2>
          <input 
            type="password" 
            placeholder="पासवर्ड (admin123)" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="p-3 bg-slate-700 rounded-lg outline-none"
          />
          <button type="submit" className="bg-yellow-500 text-black font-bold p-3 rounded-lg hover:bg-yellow-400">लॉगिन</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">एडमिन पैनल</h1>
      </div>

      {message && (
        <div className="bg-green-600 p-3 rounded-lg mb-6 shadow-md flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-white font-bold">&times;</button>
        </div>
      )}

      <div className="flex border-b border-slate-700 mb-6">
        <button onClick={() => setActiveTab('categories')} className={`py-3 px-6 font-bold text-lg ${activeTab === 'categories' ? 'border-b-4 border-blue-500 text-blue-400' : 'text-slate-400'}`}>कैटेगरी मैनेजर</button>
        <button onClick={() => setActiveTab('videos')} className={`py-3 px-6 font-bold text-lg ${activeTab === 'videos' ? 'border-b-4 border-green-500 text-green-400' : 'text-slate-400'}`}>वीडियो अपलोडर</button>
      </div>

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleAddCategory} className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-lg sticky top-24 border border-slate-700">
              <h2 className="text-xl font-bold text-blue-400">नई कैटेगरी बनाएं</h2>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">कैटेगरी का नाम</label>
                <input 
                  type="text" 
                  placeholder="जैसे: Rhymes, Maths" 
                  value={catName} 
                  onChange={e => setCatName(e.target.value)} 
                  className="p-3 bg-slate-700 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">किसके अंदर बनाना है? (पैरेंट)</label>
                <CustomSelect 
                  options={categoryOptions}
                  value={parentCatId}
                  onChange={setParentCatId}
                  placeholder="-- मुख्य कैटेगरी (None) --"
                />
              </div>

              <button type="submit" className="bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-500 mt-2 transition-colors">कैटेगरी जोड़ें</button>
            </form>
          </div>

          <div className="md:col-span-3 bg-slate-800 p-6 rounded-xl shadow-lg h-[70vh] overflow-y-auto border border-slate-700">
            <h2 className="text-xl font-bold text-slate-300 mb-4">कैटेगरी ट्री</h2>
            <div className="flex flex-col gap-2">
              {categories.length === 0 && <p className="text-slate-500">अभी कोई कैटेगरी नहीं है।</p>}
              {renderCategoryTree(null)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleAddVideo} className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-green-400">नया वीडियो जोड़ें</h2>
            
            <div>
              <label className="text-sm text-slate-400 mb-1 block">YouTube URL</label>
              <input type="text" placeholder="https://youtu.be/..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">टाइटल (वैकल्पिक)</label>
              <input type="text" placeholder="वीडियो का नाम" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full outline-none" />
            </div>

            {/* कैस्केडिंग ड्रॉपडाउन का UI */}
            <div className="flex flex-col gap-2 border border-slate-600 p-3 rounded-lg bg-slate-900/50">
              <label className="text-sm text-slate-400 font-bold">कैटेगरी चुनें</label>
              {selectedPath.map((selected, level) => (
                <div key={level} className="mb-2">
                  <label className="text-xs text-slate-500 mb-1 block">लेवल {level + 1}</label>
                  <CustomSelect 
                    options={getNextLevelOptions(level)} 
                    value={selected.id} 
                    onChange={(val) => handleCategoryChange(level, val)} 
                    placeholder={`-- लेवल ${level + 1} चुनें --`}
                  />
                </div>
              ))}

              {/* अगर पिछले लेवल पर कैटेगरी चुनी गई है और उसकी सब-कैटेगरी हैं, तो अगला ड्रॉपडाउन दिखाएं */}
              {(() => {
                const nextLevel = selectedPath.length;
                const nextOptions = getNextLevelOptions(nextLevel);
                if (nextOptions.length > 0) {
                  return (
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">लेवल {nextLevel + 1}</label>
                      <CustomSelect 
                        options={nextOptions} 
                        value="" 
                        onChange={(val) => handleCategoryChange(nextLevel, val)} 
                        placeholder={`-- लेवल ${nextLevel + 1} चुनें --`}
                      />
                    </div>
                  );
                }
                return null;
              })()}
              {selectedPath.length > 0 && (
                <div className="text-xs text-green-400 mt-2 bg-green-900/30 p-2 rounded">
                  चुना गया रास्ता: {selectedPath.map(p => p.name).join(' > ')}
                </div>
              )}
            </div>

            <button type="submit" className="bg-green-600 p-3 rounded-lg font-bold hover:bg-green-500 mt-2 transition-colors">वीडियो अपलोड करें</button>
          </form>

          <div className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-yellow-400">Bulk Upload</h2>
            
            <div className="flex flex-col gap-2 border border-slate-600 p-3 rounded-lg bg-slate-900/50">
              <label className="text-sm text-slate-400 font-bold">कैटेगरी चुनें (सबके लिए)</label>
              {selectedPath.map((selected, level) => (
                <div key={level} className="mb-2">
                  <label className="text-xs text-slate-500 mb-1 block">लेवल {level + 1}</label>
                  <CustomSelect 
                    options={getNextLevelOptions(level)} 
                    value={selected.id} 
                    onChange={(val) => handleCategoryChange(level, val)} 
                    placeholder={`-- लेवल ${level + 1} चुनें --`}
                  />
                </div>
              ))}
              {(() => {
                const nextLevel = selectedPath.length;
                const nextOptions = getNextLevelOptions(nextLevel);
                if (nextOptions.length > 0) {
                  return (
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">लेवल {nextLevel + 1}</label>
                      <CustomSelect 
                        options={nextOptions} 
                        value="" 
                        onChange={(val) => handleCategoryChange(nextLevel, val)} 
                        placeholder={`-- लेवल ${nextLevel + 1} चुनें --`}
                      />
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">YouTube URLs (एक लाइन में एक)</label>
              <textarea placeholder="https://youtu.be/url1&#10;https://youtu.be/url2" value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full h-32 outline-none resize-none font-mono text-sm" />
            </div>

            <button onClick={handleBulkUpload} disabled={isBulkUploading} className="bg-yellow-500 text-black p-3 rounded-lg font-bold hover:bg-yellow-400 mt-2 disabled:opacity-50">
              {isBulkUploading ? 'अपलोड हो रहा है...' : 'सभी वीडियो अपलोड करें'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}