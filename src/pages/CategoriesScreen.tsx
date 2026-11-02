import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

export default function CategoriesScreen() {
  const navigate = useNavigate();
  const { categories } = useCategories();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">सभी कैटेगरीज़</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div 
            key={cat.id} 
            onClick={() => navigate(`/?category=${cat.name}`)}
            className="bg-slate-800 p-6 rounded-xl text-center cursor-pointer hover:bg-slate-700 shadow-lg"
          >
            <div className="text-3xl mb-2">📁</div>
            <h3 className="font-bold text-lg">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}