import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import PlayerScreen from './pages/PlayerScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play/:videoId" element={<PlayerScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;