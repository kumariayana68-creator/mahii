import React, { useState } from 'react';
import {
  Play,
  Search,
  ExternalLink,
  Music,
  Heart,
  Sparkles,
  Radio,
  Disc,
} from 'lucide-react';

interface SpotifyItem {
  id: string;
  type: 'track' | 'playlist';
  title: string;
  artist: string;
  category: 'romantic' | 'chill' | 'trending';
  embedUrl: string;
}

export const SpotifyPlayerTool: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedItem, setSelectedItem] = useState<SpotifyItem>({
    id: '5EWPGh7jbTNO2IlW3Vybd8',
    type: 'track',
    title: 'Kesariya (From "Brahmastra")',
    artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya',
    category: 'romantic',
    embedUrl: 'https://open.spotify.com/embed/track/5EWPGh7jbTNO2IlW3Vybd8?utm_source=generator&theme=0',
  });
  const [activeCategory, setActiveCategory] = useState<'all' | 'romantic' | 'chill' | 'trending'>('all');
  const [customInput, setCustomInput] = useState('');

  const curatedSpotify: SpotifyItem[] = [
    {
      id: '5EWPGh7jbTNO2IlW3Vybd8',
      type: 'track',
      title: 'Kesariya',
      artist: 'Arijit Singh, Pritam',
      category: 'romantic',
      embedUrl: 'https://open.spotify.com/embed/track/5EWPGh7jbTNO2IlW3Vybd8?utm_source=generator&theme=0',
    },
    {
      id: '0yLdt18Q3oQp2b8m2n07b0',
      type: 'track',
      title: 'Apna Bana Le',
      artist: 'Arijit Singh, Sachin-Jigar',
      category: 'romantic',
      embedUrl: 'https://open.spotify.com/embed/track/0yLdt18Q3oQp2b8m2n07b0?utm_source=generator&theme=0',
    },
    {
      id: '3yHyi9c61qbmpeuWvKVr81',
      type: 'track',
      title: 'Chaleya (From "Jawan")',
      artist: 'Anirudh Ravichander, Arijit Singh, Shilpa Rao',
      category: 'trending',
      embedUrl: 'https://open.spotify.com/embed/track/3yHyi9c61qbmpeuWvKVr81?utm_source=generator&theme=0',
    },
    {
      id: '1e4v3kS49H9kU3dKq5iZ1K',
      type: 'track',
      title: 'Heeriye (feat. Arijit Singh)',
      artist: 'Jasleen Royal, Arijit Singh',
      category: 'romantic',
      embedUrl: 'https://open.spotify.com/embed/track/1e4v3kS49H9kU3dKq5iZ1K?utm_source=generator&theme=0',
    },
    {
      id: '37i9dQZF1DX0XUfTFmNBRM',
      type: 'playlist',
      title: 'Bollywood Butter',
      artist: 'Top Bollywood Romantic Hits Playlist',
      category: 'trending',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUfTFmNBRM?utm_source=generator&theme=0',
    },
    {
      id: '37i9dQZF1DX8g993Z8j2tq',
      type: 'playlist',
      title: 'Romantic Hindi Melodies',
      artist: 'Pure Heartfelt Love Playlist',
      category: 'romantic',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8g993Z8j2tq?utm_source=generator&theme=0',
    },
    {
      id: '37i9dQZF1DWZ0n1fX7H3nC',
      type: 'playlist',
      title: 'Chill Lofi Vibes & Sunset',
      artist: 'Relaxing Late Night Ambient Playlist',
      category: 'chill',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZ0n1fX7H3nC?utm_source=generator&theme=0',
    },
  ];

  const handleSearchOnSpotify = (query = searchQuery) => {
    const q = encodeURIComponent(query.trim() || 'Romantic Bollywood Songs');
    window.open(`https://open.spotify.com/search/${q}`, '_blank');
  };

  const handleLoadCustomSpotify = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInput.trim();
    if (!val) return;

    // Detect track or playlist from URL or URI
    // e.g. https://open.spotify.com/track/5EWPGh7jbTNO2IlW3Vybd8 or /playlist/XYZ
    const trackMatch = val.match(/track\/([a-zA-Z0-9]+)/);
    const playlistMatch = val.match(/playlist\/([a-zA-Z0-9]+)/);

    if (trackMatch) {
      const id = trackMatch[1];
      setSelectedItem({
        id,
        type: 'track',
        title: 'Custom Spotify Track',
        artist: 'Loaded via Link',
        category: 'romantic',
        embedUrl: `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`,
      });
      setCustomInput('');
    } else if (playlistMatch) {
      const id = playlistMatch[1];
      setSelectedItem({
        id,
        type: 'playlist',
        title: 'Custom Spotify Playlist',
        artist: 'Loaded via Link',
        category: 'romantic',
        embedUrl: `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`,
      });
      setCustomInput('');
    } else {
      handleSearchOnSpotify(val);
    }
  };

  const filteredItems = curatedSpotify.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-4 text-white">
      {/* Search & Custom Link Bar */}
      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-black text-sm">
              🎧
            </div>
            <span className="text-xs font-bold text-white">Spotify Play Songs & Search</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Spotify Player
          </span>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              handleSearchOnSpotify(searchQuery);
            }
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search song, artist, album on Spotify..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/30 cursor-pointer transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Embedded Spotify Player Widget */}
      <div className="rounded-3xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
        <iframe
          src={selectedItem.embedUrl}
          width="100%"
          height={selectedItem.type === 'playlist' ? '352' : '152'}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-3xl"
        />
      </div>

      {/* Direct Open in Spotify App Bar */}
      <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            Selected for Mahii & You
          </span>
          <h4 className="text-xs font-bold text-white truncate">{selectedItem.title}</h4>
          <p className="text-[11px] text-neutral-400 truncate">{selectedItem.artist}</p>
        </div>

        <button
          onClick={() =>
            window.open(
              `https://open.spotify.com/${selectedItem.type}/${selectedItem.id}`,
              '_blank'
            )
          }
          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-500/20"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Spotify</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: '✨ All Tracks' },
          { id: 'romantic', label: '❤️ Romantic Love' },
          { id: 'trending', label: '🔥 Bollywood Hits' },
          { id: 'chill', label: '🌙 Late Night Chill' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recommended Spotify Songs & Playlists List */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-400 block px-1">
          Listen to Romantic Songs on Spotify
        </span>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    {item.type === 'playlist' ? (
                      <Disc className="w-5 h-5" />
                    ) : (
                      <Music className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 truncate">
                    <h5 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-[10px] text-neutral-400 truncate">{item.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase font-semibold">
                    {item.type}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-500 text-black'
                        : 'bg-neutral-900 text-neutral-400 group-hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
