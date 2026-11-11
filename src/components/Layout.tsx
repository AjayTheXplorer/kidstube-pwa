import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // PWA इंस्टॉल के लिए स्टेट
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // इंस्टॉल प्रॉम्प्ट इवेंट को पकड़ें
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // चेक करें कि ऐप पहले से इंस्टॉल है या नहीं
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // जब ऐप इंस्टॉल हो जाए, तो स्टेट अपडेट करें
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // ब्राउज़र का इंस्टॉल डायलॉग दिखाएं
    installPrompt.prompt();
    
    // यूज़र की पसंद चेक करें (Accept/Reject)
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // इवेंट को रीसेट करें
    setInstallPrompt(null);
    setIsDrawerOpen(false);
  };

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
          
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            <button onClick={() => handleNavigation('/')} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg text-left">
              🏠 होम
            </button>
            <button onClick={() => handleNavigation('/categories')} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg text-left">
              📁 सभी कैटेगरीज़
            </button>
            <button onClick={() => handleNavigation('/settings')} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg text-left">
              ⚙️ सेटिंग्स
            </button>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-700 flex flex-col gap-3">
            {/* डाउनलोड ऐप बटन (सिर्फ तब दिखेगा जब ऐप इंस्टॉल हो सकता हो) */}
            {installPrompt && !isInstalled && (
              <button 
                onClick={handleInstallClick} 
                className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white font-bold hover:bg-green-500 rounded-lg w-full shadow-lg transition-transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                ऐप डाउनलोड करें
              </button>
            )}

            <button onClick={() => handleNavigation('/admin')} className="flex items-center justify-center gap-2 p-3 bg-yellow-500 text-black font-bold hover:bg-yellow-400 rounded-lg w-full">
              एडमिन पैनल
            </button>
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