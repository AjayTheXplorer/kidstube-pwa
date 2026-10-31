import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import PlayerScreen from './pages/PlayerScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play/:videoId" element={<PlayerScreen />} />
      </Routes>
    </Router>
  );
}

export default App;