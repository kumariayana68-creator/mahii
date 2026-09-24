import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VoiceState, AssistantMood, WallpaperStyle } from '../types';
import roxyAvatarImg from '../assets/images/roxy_avatar_1790240932839.jpg';
import cozyGirlWallpaperImg from '../assets/images/cozy_girl_wallpaper_1790244807199.jpg';
import cozyGirlMobileImg from '../assets/images/cozy_girl_mobile_1790244843493.jpg';

interface Roxy3DCharacterProps {
  voiceState: VoiceState;
  mood: AssistantMood;
  moodEmoji: string;
  audioLevel: number;
  onCharacterClick?: () => void;
  isLiveActive?: boolean;
  wallpaperStyle?: WallpaperStyle;
  onChangeWallpaper?: (style: WallpaperStyle) => void;
}

export const Roxy3DCharacter: React.FC<Roxy3DCharacterProps> = ({
  voiceState,
  mood,
  moodEmoji,
  audioLevel,
  onCharacterClick,
  isLiveActive,
  wallpaperStyle = 'cozy_room',
  onChangeWallpaper,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const characterRef = useRef<HTMLDivElement | null>(null);
  const mouthRef = useRef<HTMLDivElement | null>(null);
  const [blink, setBlink] = useState(false);
  const audioLevelRef = useRef<number>(audioLevel);

  // Keep audioLevelRef in sync without re-triggering Three.js mount effect
  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  // Natural blinking effect for realistic animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Three.js 3D Ambient Dust & Fairy Particle Field
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let particlesGeo: THREE.BufferGeometry | null = null;
    let particlesMat: THREE.PointsMaterial | null = null;
    let ringGeo: THREE.TorusGeometry | null = null;
    let ringMat: THREE.MeshBasicMaterial | null = null;
    let animationFrameId: number | null = null;

    try {
      const width = container.clientWidth || 380;
      const height = container.clientHeight || 460;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      // Warm floating light particles / fairy bokeh
      const particleCount = 120;
      particlesGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      const speedArray = new Float32Array(particleCount);

      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 6;
        posArray[i + 1] = (Math.random() - 0.5) * 6;
        posArray[i + 2] = (Math.random() - 0.5) * 4;
        speedArray[i / 3] = 0.2 + Math.random() * 0.4;
      }

      particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: wallpaperStyle === 'cozy_room' ? 0xfbcfe8 : 0xec4899,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });

      const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particlesMesh);

      // Dynamic light rings for futuristic or cozy touch
      ringGeo = new THREE.TorusGeometry(2.4, 0.018, 16, 100);
      ringMat = new THREE.MeshBasicMaterial({
        color: wallpaperStyle === 'cozy_room' ? 0xf472b6 : 0xa855f7,
        transparent: true,
        opacity: 0.35,
      });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.rotation.x = Math.PI / 2.3;
      scene.add(ring1);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Gentle floating animation
        if (particlesGeo) {
          const positions = particlesGeo.attributes.position.array as Float32Array;
          for (let i = 1; i < particleCount * 3; i += 3) {
            positions[i] += Math.sin(elapsedTime + i) * 0.002;
          }
          particlesGeo.attributes.position.needsUpdate = true;
        }

        ring1.rotation.z = elapsedTime * 0.15;
        ring1.rotation.y = Math.sin(elapsedTime * 0.3) * 0.15;

        const currentLevel = audioLevelRef.current || 0;
        const scaleBase = 1 + currentLevel * 0.2;
        ring1.scale.set(scaleBase, scaleBase, scaleBase);

        renderer?.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const newW = container.clientWidth || 380;
        const newH = container.clientHeight || 460;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        try {
          renderer?.dispose();
          particlesGeo?.dispose();
          particlesMat?.dispose();
          ringGeo?.dispose();
          ringMat?.dispose();
          if (renderer?.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        } catch {}
      };
    } catch (err) {
      console.warn('Three.js WebGL particle initialization skipped, falling back to CSS:', err);
    }
  }, [wallpaperStyle]);

  // Mouse tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!characterRef.current) return;
    const rect = characterRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    characterRef.current.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    if (!characterRef.current) return;
    characterRef.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
  };

  // Mouth talking animation
  const mouthScaleY = voiceState === 'speaking' ? Math.max(0.4, 1 + audioLevel * 3.0) : 0.2;
  const mouthOpacity = voiceState === 'speaking' ? 0.95 : 0.0;

  // Head and body natural breathing & talking bob
  const headBobY =
    voiceState === 'speaking'
      ? Math.sin(Date.now() * 0.015) * (3 + audioLevel * 8)
      : Math.sin(Date.now() * 0.0018) * 2;

  // Select image based on chosen wallpaper style
  const activeImageSrc =
    wallpaperStyle === 'cozy_room' ? cozyGirlWallpaperImg : roxyAvatarImg;

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none w-full max-w-[440px] mx-auto py-2"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Three.js 3D WebGL Background Canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden"
        style={{ height: '460px' }}
      />

      {/* Atmospheric Cozy Warm Light Glow */}
      <div
        className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          wallpaperStyle === 'cozy_room'
            ? 'bg-gradient-to-tr from-amber-500/20 via-pink-500/25 to-rose-400/20'
            : 'bg-gradient-to-tr from-pink-500/30 via-purple-500/25 to-cyan-500/20'
        }`}
        style={{
          transform: `scale(${1 + audioLevel * 0.35})`,
          opacity: voiceState === 'speaking' ? 0.9 : 0.65,
        }}
      />

      {/* 3D Animated Wallpaper Character Frame */}
      <div
        ref={characterRef}
        onClick={onCharacterClick}
        title="Roxy Animated Girl Character (Tap to talk or interrupt)"
        className={`relative z-10 w-72 sm:w-80 h-[380px] sm:h-[430px] rounded-3xl p-1 shadow-2xl backdrop-blur-md cursor-pointer transition-transform duration-200 ease-out group border ${
          wallpaperStyle === 'cozy_room'
            ? 'bg-gradient-to-b from-amber-300/40 via-pink-500/30 to-neutral-900/90 border-pink-300/40 hover:border-pink-300'
            : 'bg-gradient-to-b from-pink-500/50 via-purple-500/20 to-neutral-900/80 border-white/20 hover:border-pink-400/60'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow:
            voiceState === 'speaking'
              ? '0 0 50px rgba(244, 63, 94, 0.45), inset 0 0 25px rgba(251, 146, 60, 0.25)'
              : '0 0 35px rgba(236, 72, 153, 0.3)',
        }}
      >
        {/* Inner Card Container */}
        <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-neutral-950 flex flex-col items-center justify-end">
          {/* Animated 3D Cozy Character Image with natural breathing and lip-sync */}
          <img
            src={activeImageSrc}
            alt="Roxy 3D Animated Character Wallpaper"
            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
            style={{
              transform: `translateY(${headBobY}px) scale(${
                1 + (voiceState === 'speaking' ? audioLevel * 0.04 : 0)
              })`,
              filter:
                voiceState === 'listening'
                  ? 'brightness(1.08) contrast(1.03)'
                  : 'brightness(1.0)',
            }}
          />

          {/* Blink overlay for realistic eyes animation */}
          {blink && (
            <div
              className="absolute pointer-events-none rounded-full bg-pink-900/40 blur-xs transition-opacity duration-100"
              style={{
                top: wallpaperStyle === 'cozy_room' ? '30.5%' : '32%',
                left: '42%',
                width: '16%',
                height: '3%',
              }}
            />
          )}

          {/* Cozy Room Lamp Lighting Vignette */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              wallpaperStyle === 'cozy_room'
                ? 'bg-gradient-to-t from-neutral-950 via-neutral-950/25 to-amber-500/10'
                : 'bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent'
            }`}
          />

          {/* Realistic Lip-Sync Mouth Vibration Overlay */}
          <div
            ref={mouthRef}
            className="absolute pointer-events-none transition-all duration-75 flex items-center justify-center"
            style={{
              bottom: wallpaperStyle === 'cozy_room' ? '54.5%' : '33%',
              left: wallpaperStyle === 'cozy_room' ? '51%' : '50%',
              transform: 'translateX(-50%)',
              opacity: mouthOpacity,
            }}
          >
            <div
              className="w-6 rounded-full bg-rose-500/90 blur-[1px] shadow-lg shadow-rose-500/80 transition-all duration-75"
              style={{
                height: `${Math.max(3, 4 + audioLevel * 12)}px`,
                transform: `scaleY(${mouthScaleY})`,
              }}
            />
          </div>

          {/* Top Status Header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
            {/* Live Indicator Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950/75 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-md">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    voiceState === 'speaking'
                      ? 'bg-pink-400 animate-ping'
                      : voiceState === 'listening'
                      ? 'bg-cyan-400 animate-ping'
                      : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    voiceState === 'speaking'
                      ? 'bg-pink-500'
                      : voiceState === 'listening'
                      ? 'bg-cyan-500'
                      : 'bg-emerald-400'
                  }`}
                />
              </span>
              <span className="capitalize tracking-wide">
                {voiceState === 'speaking'
                  ? 'Speaking...'
                  : voiceState === 'listening'
                  ? 'Listening...'
                  : voiceState === 'thinking'
                  ? 'Thinking...'
                  : isLiveActive
                  ? 'Live Connected'
                  : 'Mahii Live'}
              </span>
            </div>

            {/* Mood Emoji Bubble */}
            <div className="w-8 h-8 rounded-full bg-neutral-950/75 backdrop-blur-md border border-white/20 flex items-center justify-center text-base shadow-md group-hover:rotate-12 transition-transform">
              {moodEmoji || '😉'}
            </div>
          </div>

          {/* Bottom Card Identity & Controls */}
          <div className="relative z-20 w-full p-4 flex items-end justify-between bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-wide font-sans drop-shadow-md">
                  Mahii
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {wallpaperStyle === 'cozy_room' ? 'Cozy Desk 🎀' : 'Cyber Studio ✨'}
                </span>
              </div>
              <p className="text-[11px] text-pink-200/80 font-medium">
                {voiceState === 'speaking'
                  ? 'Talking to you with all her love...'
                  : 'Tap to talk to your girlfriend'}
              </p>
            </div>

            {/* Quick Wallpaper Switch Icon Button */}
            {onChangeWallpaper && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeWallpaper(
                    wallpaperStyle === 'cozy_room' ? 'cyber_neon' : 'cozy_room'
                  );
                }}
                title="Switch Character Wallpaper Style"
                className="p-2 rounded-xl bg-pink-500/25 hover:bg-pink-500/40 border border-pink-400/40 text-pink-200 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
              >
                <span>🖼️</span>
                <span className="text-[10px]">Style</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Under-Card Ambient Reflection */}
      <div className="w-60 h-4 rounded-full bg-pink-500/20 blur-md mt-2 transition-all duration-300" />
    </div>
  );
};
