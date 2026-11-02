import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder = "-- चुनें --" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // चुनी हुई वैल्यू का लेबल ढूंढें
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-slate-700 rounded-lg outline-none text-left border border-slate-600 focus:border-blue-500"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          <div
            onClick={() => { onChange(''); setIsOpen(false); }}
            className="p-3 cursor-pointer hover:bg-slate-600 text-slate-400 border-b border-slate-600"
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`p-3 cursor-pointer hover:bg-slate-600 transition-colors border-b border-slate-600/50 last:border-0 ${value === opt.value ? 'bg-slate-600 text-blue-400 font-bold' : ''}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}