import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { addCategoryToDb, addVideoToDb } from '../services/firestoreService';

export default function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [catName, setCatName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCat, setVideoCat] = useState('');
  const [message, setMessage] = useState('');

  const { categories } = useCategories();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') setIsAuthenticated(true);
    else alert('गलत पासवर्ड!');
  };

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    await addCategoryToDb(catName);
    setMessage('कैटेगरी जोड़ी गई!');
    setCatName('');
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !videoCat) return;
    try {
      await addVideoToDb(videoUrl, videoTitle || 'Untitled', videoCat);
      setMessage('वीडियो जोड़ा गया!');
      setVideoUrl(''); setVideoTitle('');
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-white">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl shadow-lg flex flex-col gap-4 w-80">
          <h2 className="text-2xl font-bold text-center mb-2">एडमिन लॉगिन</h2>
          <input 
            type="password" placeholder="पासवर्ड (admin)" value={password} onChange={e => setPassword(e.target.value)}
            className="p-3 bg-slate-700 rounded-lg outline-none"
          />
          <button type="submit" className="bg-yellow-500 text-black font-bold p-3 rounded-lg">लॉगिन</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">एडमिन पैनल</h1>
      
      {message && <div className="bg-green-600 p-3 rounded-lg mb-4">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleAddCat} className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4">
          <h2 className="text-xl font-bold text-blue-400">नई कैटेगरी</h2>
          <input type="text" placeholder="कैटेगरी का नाम" value={catName} onChange={e => setCatName(e.target.value)} className="p-3 bg-slate-700 rounded-lg" />
          <button type="submit" className="bg-blue-600 p-3 rounded-lg font-bold">जोड़ें</button>
        </form>

        <form onSubmit={handleAddVideo} className="bg-slate-800 p-6 rounded-xl flex flex-col gap-4">
          <h2 className="text-xl font-bold text-green-400">नया वीडियो</h2>
          <input type="text" placeholder="YouTube URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="p-3 bg-slate-700 rounded-lg" />
          <input type="text" placeholder="टाइटल" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="p-3 bg-slate-700 rounded-lg" />
          <select value={videoCat} onChange={e => setVideoCat(e.target.value)} className="p-3 bg-slate-700 rounded-lg">
            <option value="">-- कैटेगरी चुनें --</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button type="submit" className="bg-green-600 p-3 rounded-lg font-bold">अपलोड करें</button>
        </form>
      </div>
    </div>
  );
}