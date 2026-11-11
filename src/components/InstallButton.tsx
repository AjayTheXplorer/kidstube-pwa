import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. जब ब्राउज़र को पता चले कि ऐप इंस्टॉल हो सकता है, तो यह इवेंट फायर होता है
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // ब्राउज़र का डिफ़ॉल्ट प्रॉम्प्ट रोकें
      setInstallPrompt(e); // इवेंट को सेव करें ताकि बाद में ट्रिगर कर सकें
    };

    // 2. अगर ऐप पहले से इंस्टॉल है, तो बटन न दिखाएं
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. जब ऐप इंस्टॉल हो जाए, तो बटन हटा दें
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

    // ब्राउज़र का इंस्टॉल प्रॉम्प्ट दिखाएं
    installPrompt.prompt();
    
    // यूज़र ने इंस्टॉल किया या नहीं, यह चेक करें
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setInstallPrompt(null); // इवेंट सिर्फ एक बार इस्तेमाल हो सकता है
  };

  // अगर ऐप पहले से इंस्टॉल है या ब्राउज़र सपोर्ट नहीं करता, तो कुछ न दिखाएं
  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      ऐप डाउनलोड करें
    </button>
  );
}