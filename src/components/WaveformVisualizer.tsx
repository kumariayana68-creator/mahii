import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  color?: string;
  barsCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  analyserNode,
  isActive,
  color = '#ec4899',
  barsCount = 36,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : barsCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isActive) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Idle ambient gentle wave
        const time = Date.now() * 0.003;
        for (let i = 0; i < barsCount; i++) {
          dataArray[i] = isActive
            ? 30 + Math.sin(time + i * 0.3) * 25
            : 8 + Math.sin(time + i * 0.2) * 6;
        }
      }

      const barWidth = (width / barsCount) * 0.65;
      const gap = (width - barWidth * barsCount) / (barsCount + 1);

      for (let i = 0; i < barsCount; i++) {
        // sample data evenly
        const index = Math.floor((i / barsCount) * (analyserNode ? 64 : barsCount));
        const val = dataArray[index] || 0;
        const percent = val / 255;
        const minHeight = 4;
        const barHeight = Math.max(minHeight, percent * height * 0.85);

        const x = gap + i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#f43f5e'); // rose
        gradient.addColorStop(0.5, color);   // pink/purple
        gradient.addColorStop(1, '#a855f7'); // purple

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isActive, color, barsCount]);

  return (
    <div className="w-full max-w-md h-12 flex items-center justify-center px-4">
      <canvas
        ref={canvasRef}
        width={360}
        height={48}
        className="w-full h-full"
      />
    </div>
  );
};
