import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { cn } from '../lib/utils';

interface HLSVideoProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  style?: React.CSSProperties;
}

export default function HLSVideo({
  src,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  poster,
  style
}: HLSVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;
    
    if (!video) return;

    if (Hls.isSupported()) {
      hls = new Hls({ startPosition: -1 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      className={cn("w-full h-full object-cover", className)}
      style={style}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      poster={poster}
    />
  );
}
