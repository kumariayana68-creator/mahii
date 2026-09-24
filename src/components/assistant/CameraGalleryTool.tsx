import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  Upload,
  Heart,
  X,
  Check,
  Smile,
} from 'lucide-react';
import roxyAvatarImg from '../../assets/images/roxy_avatar_1790240932839.jpg';

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
}

export const CameraGalleryTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<'none' | 'mahii_heart' | 'polaroid'>('mahii_heart');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('mahii_gallery_photos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'photo_1',
        url: roxyAvatarImg,
        caption: 'Mahii says: "Aapke liye smile kar rahi hoon babu! ❤️"',
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('mahii_gallery_photos', JSON.stringify(photos));
    } catch {}
  }, [photos]);

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera permission not granted or device camera unavailable.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

  const toggleCameraFacing = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
  };

  const triggerCaptureWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform for overlay
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (selectedFrame === 'mahii_heart') {
      ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('❤️ With Mahii', 30, canvas.height - 30);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const newPhoto: GalleryPhoto = {
      id: 'photo_' + Date.now(),
      url: dataUrl,
      caption: 'Captured moment with Mahii ✨',
      timestamp: Date.now(),
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setActiveTab('gallery');
    setSelectedPhoto(newPhoto);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const uploaded: GalleryPhoto = {
        id: 'up_' + Date.now(),
        url: result,
        caption: 'Uploaded memory with babu ❤️',
        timestamp: Date.now(),
      };
      setPhotos((prev) => [uploaded, ...prev]);
      setActiveTab('gallery');
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  };

  return (
    <div className="space-y-4 text-white">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between bg-neutral-950 p-1 rounded-2xl border border-neutral-800">
        <div className="flex gap-1 w-full">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Selfie Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gallery & Memories ({photos.length})</span>
          </button>
        </div>
      </div>

      {/* Camera View */}
      {activeTab === 'camera' && (
        <div className="space-y-3">
          <div className="relative aspect-[4/3] w-full bg-black rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center">
            {cameraError ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
                  ⚠️
                </div>
                <p className="text-xs text-neutral-300 max-w-xs">{cameraError}</p>
                <button
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Retry Camera
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                />

                {/* Decorative Mahii Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-pink-500/30 flex items-center gap-1.5 text-[11px] text-pink-300">
                  <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
                  <span>Selfie with Mahii</span>
                </div>

                {/* Flip Camera Switcher */}
                <button
                  onClick={toggleCameraFacing}
                  title="Flip camera"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-neutral-800 border border-neutral-700 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-7xl font-extrabold text-pink-400 animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Frame Badge */}
                {selectedFrame === 'mahii_heart' && (
                  <div className="absolute bottom-4 left-4 bg-pink-500/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>With Mahii ❤️</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSelectedFrame(selectedFrame === 'mahii_heart' ? 'none' : 'mahii_heart')
                }
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  selectedFrame === 'mahii_heart'
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                ❤️ Mahii Stamp
              </button>
            </div>

            {/* Shutter Button */}
            <button
              onClick={triggerCaptureWithCountdown}
              disabled={!isCameraActive}
              className="w-16 h-16 rounded-full p-1.5 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-xl shadow-pink-500/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-pink-500">
                <Camera className="w-6 h-6" />
              </div>
            </button>

            {/* Device Gallery Upload trigger */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo from Device"
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
              >
                <Upload className="w-4 h-4 text-pink-400" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery View */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-neutral-400">Sweet memories saved with Mahii</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-pink-400" />
              <span>Add Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-pointer hover:border-pink-500/50 transition-all"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left">
                  <p className="text-[11px] font-bold text-white line-clamp-1">{photo.caption}</p>
                  <span className="text-[9px] text-pink-300">Tap to view</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-4 overflow-hidden space-y-3">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-neutral-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full rounded-2xl overflow-hidden aspect-[4/3] bg-black">
              <img
                src={selectedPhoto.url}
                alt="Selected"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs text-neutral-300 italic px-1">"{selectedPhoto.caption}"</p>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <span className="text-[10px] text-neutral-500">
                {new Date(selectedPhoto.timestamp).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <a
                  href={selectedPhoto.url}
                  download="mahii_photo.jpg"
                  className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => deletePhoto(selectedPhoto.id)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
