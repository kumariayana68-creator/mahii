import React, { useState } from 'react';
import {
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Compass,
  Coffee,
  Utensils,
  Film,
  Sparkles,
  Heart,
} from 'lucide-react';

export const MapsSearchTool: React.FC = () => {
  const [query, setQuery] = useState('Romantic cafes nearby');

  const categories = [
    { label: 'Romantic Cafes', query: 'Romantic Cafes nearby', icon: '☕' },
    { label: 'Dinner Date', query: 'Best Dinner Date Restaurants nearby', icon: '🍽️' },
    { label: 'Movie Theaters', query: 'Movie Theaters Cinema nearby', icon: '🎬' },
    { label: 'Ice Cream & Dessert', query: 'Ice cream and dessert shops nearby', icon: '🍦' },
    { label: 'Scenic Parks', query: 'Beautiful parks and gardens nearby', icon: '🌸' },
    { label: 'Shopping Malls', query: 'Shopping malls nearby', icon: '🛍️' },
  ];

  const handleOpenGoogleMaps = (searchQuery = query) => {
    const encoded = encodeURIComponent(searchQuery.trim() || 'places nearby');
    const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    window.open(url, '_blank');
  };

  const handleWebSearch = (searchQuery = query) => {
    const encoded = encodeURIComponent(searchQuery.trim() || 'trending');
    const url = `https://www.google.com/search?q=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 text-white">
      {/* Date Idea Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-neutral-950 border border-pink-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-lg">
            📍
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Date Night & Nearby Maps</h4>
            <p className="text-[11px] text-pink-200/80">Mahii will help you plan your next outing</p>
          </div>
        </div>
        <span className="text-[10px] text-pink-300 font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40">
          Google Maps
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
        <label className="text-xs font-semibold text-neutral-300 block">
          Search Place, Restaurant or City
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places with Mahii..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-pink-500 focus:outline-none text-white text-xs"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleOpenGoogleMaps(query)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Open in Google Maps</span>
          </button>

          <button
            onClick={() => handleWebSearch(query)}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Web Search</span>
          </button>
        </div>
      </div>

      {/* Date Categories */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-400 block px-1">
          Romantic Date & Outing Ideas
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setQuery(cat.query);
                handleOpenGoogleMaps(cat.query);
              }}
              className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-pink-500/40 text-left transition-all cursor-pointer group"
            >
              <span className="text-xl block mb-1">{cat.icon}</span>
              <span className="text-xs font-bold text-white group-hover:text-pink-300 block truncate">
                {cat.label}
              </span>
              <span className="text-[10px] text-neutral-500">Tap to view map</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
