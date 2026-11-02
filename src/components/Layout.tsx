import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative">
      
      {/* हेडर */}
      <header className="bg-blue-900 p-4 sticky top-0 z-30 flex items-center gap-3 shadow-md">
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {/* लोगो क्लिक करने पर होम पर जाएं */}
        <button onClick={() => handleNavigation('/')} className="text-2xl font-bold hover:text-yellow-400 transition-colors">
          KidsTube
        </button>
      </header>

      {/* साइड ड्रॉवर */}
      <div className={`fixed inset-0 z-50 flex transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-64 bg-slate-800 h-full p-4 shadow-2xl flex flex-col transition-transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <h2 className="text-2xl font-bold text-yellow-400">मेनू</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
          </div>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => handleNavigation('/')} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg text-left">
              🏠 होम
            </button>
            <button onClick={() => handleNavigation('/categories')} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg text-left">
              📁 सभी कैटेगरीज़
            </button>
            <button onClick={() => handleNavigation('/settings')} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg text-left">
              ⚙️ सेटिंग्स
            </button>
            
            <div className="mt-auto pt-4 border-t border-slate-700">
              <button onClick={() => handleNavigation('/admin')} className="flex items-center gap-3 p-3 bg-yellow-500 text-black font-bold hover:bg-yellow-400 rounded-lg w-full">
                एडमिन पैनल
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-black/60" onClick={() => setIsDrawerOpen(false)}></div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}