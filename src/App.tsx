import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomeScreen from './pages/HomeScreen';
import PlayerScreen from './pages/PlayerScreen';
import AdminScreen from './pages/AdminScreen';
import CategoriesScreen from './pages/CategoriesScreen';
import SettingsScreen from './pages/SettingsScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout वाले राउट्स */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/categories" element={<CategoriesScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
        </Route>
        
        {/* फुल स्क्रीन राउट (बिना हेडर के) */}
        <Route path="/play/:videoId" element={<PlayerScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;