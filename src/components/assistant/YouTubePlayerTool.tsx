import React, { useState } from 'react';
import {
  Play,
  Search,
  ExternalLink,
  Youtube,
  Sparkles,
  Music,
  Film,
  Flame,
  Check,
} from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  artistOrChannel: string;
  category: string;
  duration?: string;
  thumbnailUrl?: string;
}

export const YouTubePlayerTool: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeVideoId, setActiveVideoId] = useState('BddP6PYo2gs'); // Kesariya default
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'romantic' | 'lofi' | 'trending'>('all');

  const curatedVideos: YouTubeVideo[] = [
    {
      id: 'BddP6PYo2gs',
      title: 'Kesariya - Brahmāstra',
      artistOrChannel: 'Arijit Singh, Pritam',
      category: 'romantic',
      duration: '4:28',
    },
    {
      id: 'gvyUuxdRdR4',
      title: 'Raataan Lambiyan - Shershaah',
      artistOrChannel: 'Jubin Nautiyal, Asees Kaur',
      category: 'romantic',
      duration: '3:50',
    },
    {
      id: 'ElZfdU54Cp8',
      title: 'Apna Bana Le - Bhediya',
      artistOrChannel: 'Arijit Singh, Sachin-Jigar',
      category: 'romantic',
      duration: '4:21',
    },
    {
      id: 'Umqb9KENgmk',
      title: 'Tum Hi Ho - Aashiqui 2',
      artistOrChannel: 'Arijit Singh, Mithoon',
      category: 'romantic',
      duration: '4:22',
    },
    {
      id: 'tSgT_9f_fHY',
      title: 'Pehle Bhi Main - ANIMAL',
      artistOrChannel: 'Vishal Mishra, Raj Shekhar',
      category: 'romantic',
      duration: '4:10',
    },
    {
      id: 'jfKfPfyJRdk',
      title: 'lofi hip hop radio - beats to relax/study to',
      artistOrChannel: 'Lofi Girl Live',
      category: 'lofi',
      duration: 'Live 24/7',
    },
    {
      id: '4xDzrJKXOOY',
      title: 'Bollywood Romantic Lofi Chill Mashup',
      artistOrChannel: 'Lofi Records',
      category: 'lofi',
      duration: '32:15',
    },
    {
      id: 'k4yXQkG2s1E',
      title: 'Dil Diyan Gallan - Tiger Zinda Hai',
      artistOrChannel: 'Atif Aslam, Vishal-Shekhar',
      category: 'trending',
      duration: '4:20',
    },
  ];

  // Extract ID from full URL or return ID as-is
  const extractVideoId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    // Check youtu.be/ID
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    // Check watch?v=ID
    const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (longMatch) return longMatch[1];
    // Check embed/ID
    const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    // If 11 chars
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    return '';
  };

  const handleCustomLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = extractVideoId(customInputUrl);
    if (vidId) {
      setActiveVideoId(vidId);
      setCustomInputUrl('');
    } else if (customInputUrl.trim()) {
      handleSearchOnYouTube(customInputUrl.trim());
    }
  };

  const handleSearchOnYouTube = (term = searchQuery) => {
    const q = encodeURIComponent(term.trim() || 'Romantic Bollywood Songs');
    window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
  };

  const filteredVideos = curatedVideos.filter((vid) => {
    const matchesCategory = activeCategory === 'all' || vid.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.artistOrChannel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const activeVideo = curatedVideos.find((v) => v.id === activeVideoId);

  return (
    <div className="space-y-4 text-white">
      {/* Search & Custom Link Bar */}
      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Youtube className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">YouTube Video Player & Search</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
            HD In-App Player
          </span>
        </div>

        {/* Search input with direct submit */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              const id = extractVideoId(searchQuery);
              if (id) {
                setActiveVideoId(id);
              } else {
                handleSearchOnYouTube(searchQuery);
              }
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
              placeholder="Search romantic songs, videos or paste link..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Embedded High-Fidelity YouTube Player */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
          title="YouTube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      {/* Now Playing Bar with Direct YouTube Link */}
      <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
            Now Playing with Mahii
          </span>
          <h4 className="text-xs font-bold text-white truncate">
            {activeVideo ? activeVideo.title : `Video ID: ${activeVideoId}`}
          </h4>
          <p className="text-[11px] text-neutral-400 truncate">
            {activeVideo ? activeVideo.artistOrChannel : 'Custom Loaded YouTube Video'}
          </p>
        </div>

        <button
          onClick={() => window.open(`https://www.youtube.com/watch?v=${activeVideoId}`, '_blank')}
          className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-neutral-800"
        >
          <ExternalLink className="w-3.5 h-3.5 text-red-400" />
          <span>Open in App</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: '✨ All Songs' },
          { id: 'romantic', label: '❤️ Romantic Bollywood' },
          { id: 'lofi', label: '🎧 Lo-Fi & Chill' },
          { id: 'trending', label: '🔥 Trending Hits' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-red-600/20 border-red-500 text-red-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video Recommendations Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-400 block px-1">
          Handpicked Songs to Listen With Mahii
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {filteredVideos.map((video) => {
            const isSelected = activeVideoId === video.id;
            return (
              <button
                key={video.id}
                onClick={() => setActiveVideoId(video.id)}
                className={`p-2.5 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-red-600/15 border-red-500/50 shadow-md shadow-red-600/10'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play
                      className={`w-4 h-4 ${
                        isSelected ? 'text-red-400 fill-current' : 'text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-white truncate group-hover:text-red-300 transition-colors">
                    {video.title}
                  </h5>
                  <p className="text-[10px] text-neutral-400 truncate">{video.artistOrChannel}</p>
                  <span className="text-[9px] text-red-400 font-semibold">{video.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
