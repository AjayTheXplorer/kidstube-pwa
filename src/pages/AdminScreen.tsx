import { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { addCategoryToDb, addVideoToDb, updateVideoInDb, deleteVideoFromDb, updateCategoryInDb } from '../services/firestoreService';
import { subscribeToVideos } from '../services/firestoreService'; 
import type { Category, VideoItem } from '../types';
import CustomSelect from '../components/CustomSelect';

export default function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'categories' | 'videos' | 'manage'>('categories');
  const { categories } = useCategories();
  const [message, setMessage] = useState('');

  // --- कैटेगरी फॉर्म स्टेट ---
  const [catName, setCatName] = useState('');
  const [parentCatId, setParentCatId] = useState('');
  const [isMainCategory, setIsMainCategory] = useState(true); 

  // --- कैटेगरी एडिट स्टेट ---
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // --- वीडियो अपलोड स्टेट ---
  const [selectedPath, setSelectedPath] = useState<{ id: string; name: string }[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoChannel, setVideoChannel] = useState('');

  // --- Bulk Upload स्टेट ---
  const [bulkUrls, setBulkUrls] = useState('');
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // --- Manage (CRUD) स्टेट ---
  const [managePath, setManagePath] = useState<{ id: string; name: string }[]>([]);
  const [managedVideos, setManagedVideos] = useState<VideoItem[]>([]);
  
  // --- Video Edit स्टेट ---
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editChannel, setEditChannel] = useState('');
  const [editPath, setEditPath] = useState<{ id: string; name: string }[]>([]); // वीडियो की कैटेगरी का पाथ

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('गलत पासवर्ड!');
  };

  const rootCategoryOptions = categories
    .filter(c => !c.parentId) 
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => ({ value: c.id, label: c.name }));

  const handleCategoryChange = (level: number, catId: string) => {
    if (!catId) {
      setSelectedPath(prev => prev.slice(0, level));
      return;
    }
    const selectedCat = categories.find(c => c.id === catId);
    if (!selectedCat) return;
    setSelectedPath(prev => {
      const newPath = prev.slice(0, level);
      newPath.push({ id: selectedCat.id, name: selectedCat.name });
      return newPath;
    });
  };

  const handleManagePathChange = (level: number, catId: string) => {
    if (!catId) {
      setManagePath(prev => prev.slice(0, level));
      return;
    }
    const selectedCat = categories.find(c => c.id === catId);
    if (!selectedCat) return;
    setManagePath(prev => {
      const newPath = prev.slice(0, level);
      newPath.push({ id: selectedCat.id, name: selectedCat.name });
      return newPath;
    });
  };

  const handleEditPathChange = (level: number, catId: string) => {
    if (!catId) {
      setEditPath(prev => prev.slice(0, level));
      return;
    }
    const selectedCat = categories.find(c => c.id === catId);
    if (!selectedCat) return;
    setEditPath(prev => {
      const newPath = prev.slice(0, level);
      newPath.push({ id: selectedCat.id, name: selectedCat.name });
      return newPath;
    });
  };

  const getNextLevelOptions = (level: number, path: { id: string; name: string }[]) => {
    const currentParentId = level === 0 ? null : path[level - 1]?.id;
    return categories
      .filter(c => c.parentId === currentParentId)
      .map(c => ({ value: c.id, label: c.name }));
  };

  // वीडियो की वर्तमान कैटेगरी का पूरा रास्ता (Path) ढूंढने का फंक्शन
  const buildCategoryPath = (catId: string): { id: string; name: string }[] => {
    let path = [];
    let currentId: string | null | undefined = catId;
    
    // लूप तब तक चलेगा जब तक हमें मुख्य कैटेगरी (parentId null) नहीं मिल जाती
    while (currentId) {
      const cat = categories.find(c => c.id === currentId);
      if (!cat) break;
      path.unshift({ id: cat.id, name: cat.name }); // शुरुआत में जोड़ेंगे
      currentId = cat.parentId;
    }
    return path;
  };

  useEffect(() => {
    if (activeTab === 'manage' && managePath.length > 0) {
      const currentCatId = managePath[managePath.length - 1].id;
      const unsub = subscribeToVideos([currentCatId], (vids) => setManagedVideos(vids));
      return () => unsub();
    } else {
      setManagedVideos([]);
    }
  }, [activeTab, managePath]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const finalParentId = isMainCategory ? null : (parentCatId || null);
    try {
      await addCategoryToDb(catName, finalParentId);
      setMessage('कैटेगरी सफलतापूर्वक जोड़ी गई!');
      setCatName('');
      if (isMainCategory) setParentCatId('');
    } catch (error: any) {
      setMessage('त्रुटि: ' + error.message);
    }
  };

  const handleSaveCategoryEdit = async () => {
    if (!editingCategory || !editCatName.trim()) return;
    try {
      await updateCategoryInDb(editingCategory.id, editCatName.trim());
      setMessage('कैटेगरी अपडेट हो गई!');
      setEditingCategory(null);
    } catch (error: any) {
      setMessage('अपडेट में त्रुटि: ' + error.message);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentCategoryId = selectedPath[selectedPath.length - 1]?.id;
    if (!videoUrl || !currentCategoryId) {
      setMessage('कृपया URL और कैटेगरी दोनों चुनें');
      return;
    }
    try {
      await addVideoToDb(videoUrl, videoTitle || 'Untitled Video', currentCategoryId, videoChannel);
      setMessage('वीडियो सफलतापूर्वक जोड़ा गया!');
      setVideoUrl('');
      setVideoTitle('');
      setVideoChannel('');
    } catch (error: any) {
      setMessage('त्रुटि: ' + error.message);
    }
  };

  const handleBulkUpload = async () => {
    const currentCategoryId = selectedPath[selectedPath.length - 1]?.id;
    if (!currentCategoryId) {
      setMessage('कृपया पहले कैटेगरी चुनें');
      return;
    }
    const lines = bulkUrls.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    setIsBulkUploading(true);
    setMessage(`${lines.length} लाइनें प्रोसेस हो रही हैं...`);

    try {
      for (const line of lines) {
        const parts = line.split('|');
        const url = parts[0]?.trim();
        const title = parts[1]?.trim() || 'Untitled Video';
        const channel = parts[2]?.trim() || '';
        
        if (url) {
          await addVideoToDb(url, title, currentCategoryId, channel);
        }
      }
      setMessage('सभी वीडियो सफलतापूर्वक अपलोड हो गए!');
      setBulkUrls('');
    } catch (error: any) {
      setMessage('बल्क अपलोड में त्रुटि: ' + error.message);
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm("क्या आप वाकई इस वीडियो को डिलीट करना चाहते हैं?")) {
      try {
        await deleteVideoFromDb(id);
        setMessage('वीडियो डिलीट हो गया!');
      } catch (error: any) {
        setMessage('डिलीट में त्रुटि: ' + error.message);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingVideo) return;
    
    // अगर यूज़र ने कैटेगरी नहीं बदली है, तो पुरानी ही रहेगी। 
    // वरना editPath की आखिरी वैल्यू नई कैटेगरी होगी।
    const newCategoryId = editPath.length > 0 ? editPath[editPath.length - 1].id : editingVideo.categoryId;

    try {
      await updateVideoInDb(editingVideo.id, editTitle, editChannel, newCategoryId);
      setMessage('वीडियो अपडेट हो गया!');
      setEditingVideo(null);
    } catch (error: any) {
      setMessage('अपडेट में त्रुटि: ' + error.message);
    }
  };

  const handleEditClick = (video: VideoItem) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditChannel(video.channelName || '');
    // वीडियो की मौजूदा कैटेगरी का पाथ निकालें
    const currentPath = buildCategoryPath(video.categoryId);
    setEditPath(currentPath);
  };

  const renderCategoryTree = (parentId: string | null = null, depth = 0) => {
    const levelCats = categories.filter(c => c.parentId === parentId);
    if (levelCats.length === 0) return null;

    return (
      <div className="flex flex-col gap-1">
        {levelCats.map(cat => (
          <div key={cat.id}>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700" style={{ marginLeft: `${depth * 16}px` }}>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">{depth === 0 ? '📁' : '📄'}</span>
                <span className="font-medium text-sm">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingCategory(cat); setEditCatName(cat.name); }} className="text-xs bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white px-2 py-1 rounded">✏️ Edit</button>
                <button onClick={() => { setParentCatId(cat.id); setIsMainCategory(false); window.scrollTo(0, 0); }} className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-1 rounded">+ सब-कैटेगरी</button>
              </div>
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
          <input type="password" placeholder="पासवर्ड (admin123)" value={password} onChange={e => setPassword(e.target.value)} className="p-3 bg-slate-700 rounded-lg outline-none" />
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

      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('categories')} className={`py-3 px-4 md:px-6 font-bold whitespace-nowrap text-sm md:text-lg ${activeTab === 'categories' ? 'border-b-4 border-blue-500 text-blue-400' : 'text-slate-400'}`}>कैटेगरी मैनेजर</button>
        <button onClick={() => setActiveTab('videos')} className={`py-3 px-4 md:px-6 font-bold whitespace-nowrap text-sm md:text-lg ${activeTab === 'videos' ? 'border-b-4 border-green-500 text-green-400' : 'text-slate-400'}`}>वीडियो अपलोडर</button>
        <button onClick={() => setActiveTab('manage')} className={`py-3 px-4 md:px-6 font-bold whitespace-nowrap text-sm md:text-lg ${activeTab === 'manage' ? 'border-b-4 border-yellow-500 text-yellow-400' : 'text-slate-400'}`}>वीडियो मैनेज करें</button>
      </div>

      {/* CATEGORY TAB */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleAddCategory} className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-lg border border-slate-700">
              <h2 className="text-xl font-bold text-blue-400">नई कैटेगरी बनाएं</h2>
              <div className="flex bg-slate-900 rounded-lg p-1">
                <button type="button" onClick={() => { setIsMainCategory(true); setParentCatId(''); }} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-md ${isMainCategory ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>मुख्य कैटेगरी</button>
                <button type="button" onClick={() => setIsMainCategory(false)} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-md ${!isMainCategory ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>सब-कैटेगरी</button>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">कैटेगरी का नाम</label>
                <input type="text" placeholder="जैसे: Rhymes, Maths" value={catName} onChange={e => setCatName(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full outline-none" />
              </div>
              {!isMainCategory && (
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">किसके अंदर बनाना है? (पैरेंट)</label>
                  <CustomSelect options={rootCategoryOptions} value={parentCatId} onChange={setParentCatId} placeholder="-- पैरेंट कैटेगरी चुनें --" />
                </div>
              )}
              <button type="submit" className="bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-500 mt-2">कैटेगरी जोड़ें</button>
            </form>
          </div>
          <div className="md:col-span-3 bg-slate-800 p-6 rounded-xl shadow-lg h-[70vh] overflow-y-auto border border-slate-700">
            <h2 className="text-xl font-bold text-slate-300 mb-4">कैटेगरी ट्री</h2>
            {renderCategoryTree(null)}
          </div>
        </div>
      )}

      {/* VIDEO UPLOAD TAB */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleAddVideo} className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-green-400">नया वीडियो जोड़ें</h2>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">YouTube URL</label>
              <input type="text" placeholder="https://youtu.be/..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">वीडियो का टाइटल</label>
              <input type="text" placeholder="वीडियो का नाम" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">चैनल का नाम (वैकल्पिक)</label>
              <input type="text" placeholder="जैसे: Cocomelon" value={videoChannel} onChange={e => setVideoChannel(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full outline-none" />
            </div>
            <div className="flex flex-col gap-2 border border-slate-600 p-3 rounded-lg bg-slate-900/50">
              <label className="text-sm text-slate-400 font-bold">कैटेगरी चुनें</label>
              {selectedPath.map((selected, level) => (
                <div key={level} className="mb-2">
                  <label className="text-xs text-slate-500 mb-1 block">लेवल {level + 1}</label>
                  <CustomSelect options={getNextLevelOptions(level, selectedPath)} value={selected.id} onChange={(val) => handleCategoryChange(level, val)} placeholder={`-- लेवल ${level + 1} चुनें --`} />
                </div>
              ))}
              {(() => {
                const nextLevel = selectedPath.length;
                const nextOptions = getNextLevelOptions(nextLevel, selectedPath);
                if (nextOptions.length > 0) {
                  return (
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">लेवल {nextLevel + 1}</label>
                      <CustomSelect options={nextOptions} value="" onChange={(val) => handleCategoryChange(nextLevel, val)} placeholder={`-- लेवल ${nextLevel + 1} चुनें --`} />
                    </div>
                  );
                }
                return null;
              })()}
              {selectedPath.length > 0 && <div className="text-xs text-green-400 mt-2 bg-green-900/30 p-2 rounded">चुना गया रास्ता: {selectedPath.map(p => p.name).join(' > ')}</div>}
            </div>
            <button type="submit" className="bg-green-600 p-3 rounded-lg font-bold hover:bg-green-500 mt-2">वीडियो अपलोड करें</button>
          </form>

          <div className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-yellow-400">Bulk Upload</h2>
            <div className="flex flex-col gap-2 border border-slate-600 p-3 rounded-lg bg-slate-900/50">
              <label className="text-sm text-slate-400 font-bold">कैटेगरी चुनें (सबके लिए)</label>
              {selectedPath.map((selected, level) => (
                <div key={level} className="mb-2">
                  <label className="text-xs text-slate-500 mb-1 block">लेवल {level + 1}</label>
                  <CustomSelect options={getNextLevelOptions(level, selectedPath)} value={selected.id} onChange={(val) => handleCategoryChange(level, val)} placeholder={`-- लेवल ${level + 1} चुनें --`} />
                </div>
              ))}
              {(() => {
                const nextLevel = selectedPath.length;
                const nextOptions = getNextLevelOptions(nextLevel, selectedPath);
                if (nextOptions.length > 0) {
                  return (
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">लेवल {nextLevel + 1}</label>
                      <CustomSelect options={nextOptions} value="" onChange={(val) => handleCategoryChange(nextLevel, val)} placeholder={`-- लेवल ${nextLevel + 1} चुनें --`} />
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1 block">डेटा (फॉर्मेट: URL | Title | Channel)</label>
              <textarea placeholder="https://youtu.be/url1 | Rhyme Title | Cocomelon&#10;https://youtu.be/url2 | Maths Video | Kids Learning" value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} className="p-3 bg-slate-700 rounded-lg w-full h-32 outline-none resize-none font-mono text-sm" />
            </div>
            <button onClick={handleBulkUpload} disabled={isBulkUploading} className="bg-yellow-500 text-black p-3 rounded-lg font-bold hover:bg-yellow-400 mt-2 disabled:opacity-50">
              {isBulkUploading ? 'अपलोड हो रहा है...' : 'सभी वीडियो अपलोड करें'}
            </button>
          </div>
        </div>
      )}

      {/* MANAGE (CRUD) TAB */}
      {activeTab === 'manage' && (
        <div className="bg-slate-800 p-4 md:p-6 rounded-xl shadow-lg border border-slate-700">
          <h2 className="text-xl font-bold text-slate-300 mb-4">वीडियोज़ को मैनेज करें</h2>
          
          <div className="flex flex-col gap-2 border border-slate-600 p-3 rounded-lg bg-slate-900/50 mb-6">
            <label className="text-sm text-slate-400 font-bold">कैटेगरी चुनें</label>
            {managePath.map((selected, level) => (
              <div key={level} className="mb-2">
                <label className="text-xs text-slate-500 mb-1 block">लेवल {level + 1}</label>
                <CustomSelect options={getNextLevelOptions(level, managePath)} value={selected.id} onChange={(val) => handleManagePathChange(level, val)} placeholder={`-- लेवल ${level + 1} चुनें --`} />
              </div>
            ))}
            {(() => {
              const nextLevel = managePath.length;
              const nextOptions = getNextLevelOptions(nextLevel, managePath);
              if (nextOptions.length > 0) {
                return (
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">लेवल {nextLevel + 1}</label>
                    <CustomSelect options={nextOptions} value="" onChange={(val) => handleManagePathChange(nextLevel, val)} placeholder={`-- लेवल ${nextLevel + 1} चुनें --`} />
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div className="flex flex-col gap-4">
            {managedVideos.length > 0 ? (
              managedVideos.map(video => (
                <div key={video.id} className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-700 shadow-sm">
                  <div className="flex gap-3">
                    <img src={video.thumbnailUrl} className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-md shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-sm text-white line-clamp-2">{video.title}</h4>
                      {video.channelName && <p className="text-xs text-slate-400 mt-1 truncate">📺 {video.channelName}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    <button onClick={() => handleEditClick(video)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">Edit</button>
                    <button onClick={() => handleDeleteVideo(video.id)} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded text-sm font-medium">Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6 text-sm">इस कैटेगरी में कोई वीडियो नहीं है या कैटेगरी नहीं चुनी गई है।</p>
            )}
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700 relative">
            <button onClick={() => setEditingCategory(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-700/50 rounded-full p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold mb-4">कैटेगरी एडिट करें</h3>
            <div className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-sm text-slate-400 block mb-1">कैटेगरी का नाम</label>
                <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveCategoryEdit} className="flex-1 bg-green-600 p-3 rounded-lg font-bold hover:bg-green-500">सेव करें</button>
                <button onClick={() => setEditingCategory(null)} className="flex-1 bg-slate-600 p-3 rounded-lg font-bold hover:bg-slate-500">कैंसिल</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Edit Modal with Category Changer */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700 relative my-8">
            <button onClick={() => setEditingVideo(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-700/50 rounded-full p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold mb-4">वीडियो एडिट करें</h3>
            <div className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-sm text-slate-400 block mb-1">टाइटल</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">चैनल का नाम</label>
                <input type="text" value={editChannel} onChange={e => setEditChannel(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              {/* वीडियो की कैटेगरी बदलने का सेक्शन */}
              <div className="flex flex-col gap-2 border border-slate-600 p-3 rounded-lg bg-slate-900/50 mt-2">
                <label className="text-sm text-slate-400 font-bold">कैटेगरी बदलें</label>
                {editPath.map((selected, level) => (
                  <div key={level} className="mb-2">
                    <label className="text-xs text-slate-500 mb-1 block">लेवल {level + 1}</label>
                    <CustomSelect 
                      options={getNextLevelOptions(level, editPath)} 
                      value={selected.id} 
                      onChange={(val) => handleEditPathChange(level, val)} 
                      placeholder={`-- लेवल ${level + 1} चुनें --`} 
                    />
                  </div>
                ))}
                {(() => {
                  const nextLevel = editPath.length;
                  const nextOptions = getNextLevelOptions(nextLevel, editPath);
                  if (nextOptions.length > 0) {
                    return (
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">लेवल {nextLevel + 1}</label>
                        <CustomSelect 
                          options={nextOptions} 
                          value="" 
                          onChange={(val) => handleEditPathChange(nextLevel, val)} 
                          placeholder={`-- लेवल ${nextLevel + 1} चुनें --`} 
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
                {editPath.length > 0 && (
                  <div className="text-xs text-green-400 mt-2 bg-green-900/30 p-2 rounded">
                    नया रास्ता: {editPath.map(p => p.name).join(' > ')}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveEdit} className="flex-1 bg-green-600 p-3 rounded-lg font-bold hover:bg-green-500">सेव करें</button>
                <button onClick={() => setEditingVideo(null)} className="flex-1 bg-slate-600 p-3 rounded-lg font-bold hover:bg-slate-500">कैंसिल</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}