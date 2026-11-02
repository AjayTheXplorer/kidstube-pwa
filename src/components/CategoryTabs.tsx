import type { Category } from '../types';

interface Props {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onSelectCategory }: Props) {
  return (
    <div className="flex overflow-x-auto gap-3 p-4 bg-slate-900 border-b border-slate-800 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)} // यहाँ ID पास करें
          className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
            selectedCategory === cat.id // यहाँ ID से तुलना करें
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}