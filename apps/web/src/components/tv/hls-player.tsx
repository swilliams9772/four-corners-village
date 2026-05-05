"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2 } from "lucide-react";
import { recordProgress } from "@/app/actions/tv";

type PlaybackInfo = {
  manifestUrl: string;
  watermark: { userId: string; email: string };
};

/**
 * HLS player with hardened browser controls:
 *   - controlsList="nodownload" disables the chrome download button.
 *   - context menu disabled.
 *   - watermark overlay shows email + user ID. We rotate the watermark slightly
 *     and randomize position so naive screen-recordings carry it visibly.
 *
 * Progress is saved every 10s while playing, plus on unmount + ended.
 */
export function HlsPlayer({
  videoId,
  initialPosition,
}: {
  videoId: string;
  initialPosition: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [info, setInfo] = useState<PlaybackInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState({ x: 50, y: 50 });
  const lastSavedRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tv/playback/${videoId}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Playback denied (${r.status})`);
        return r.json() as Promise<PlaybackInfo>;
      })
      .then((data) => {
        if (!cancelled) {
          setInfo(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (!info || !videoRef.current) return;
    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hls.loadSource(info.manifestUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialPosition > 0) video.currentTime = initialPosition;
        void video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("[hls] fatal", data);
          setError("Playback failed. Please refresh.");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = info.manifestUrl;
      video.addEventListener("loadedmetadata", () => {
        if (initialPosition > 0) video.currentTime = initialPosition;
        void video.play().catch(() => {});
      });
    } else {
      setError("This browser cannot play HLS streams.");
    }

    return () => {
      hls?.destroy();
    };
  }, [info, initialPosition]);

  // Periodic progress save + watermark drift (every 30s the watermark moves
  // to a new corner — burns it into screen recordings)
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const progressInterval = setInterval(() => {
      if (video.paused) return;
      const now = video.currentTime;
      if (Math.abs(now - lastSavedRef.current) >= 10) {
        lastSavedRef.current = now;
        void recordProgress(videoId, now);
      }
    }, 5000);

    const watermarkInterval = setInterval(() => {
      const corners = [
        { x: 8, y: 8 },
        { x: 92, y: 8 },
        { x: 92, y: 92 },
        { x: 8, y: 92 },
      ];
      setWatermarkPos(corners[Math.floor(Math.random() * corners.length)]);
    }, 30000);

    const onEnded = () => {
      void recordProgress(videoId, video.duration ?? 0, true);
    };
    video.addEventListener("ended", onEnded);

    return () => {
      clearInterval(progressInterval);
      clearInterval(watermarkInterval);
      video.removeEventListener("ended", onEnded);
      if (video.currentTime > 0) {
        void recordProgress(videoId, video.currentTime);
      }
    };
  }, [videoId]);

  return (
    <div className="relative h-full w-full bg-black no-select">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture={false}
        playsInline
        crossOrigin="anonymous"
        onContextMenu={(e) => e.preventDefault()}
        className="h-full w-full"
      />

      {info && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="tv-watermark absolute rounded-md bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm transition-all duration-ceremony ease-velvet"
            style={{
              left: `${watermarkPos.x}%`,
              top: `${watermarkPos.y}%`,
              transform: `translate(-50%, -50%) rotate(${watermarkPos.x > 50 ? "-2deg" : "2deg"})`,
            }}
          >
            {info.watermark.email} · {info.watermark.userId.slice(0, 8)}
          </div>
        </div>
      )}

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="size-8 animate-spin text-white/80" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 p-6">
          <div className="flex max-w-md items-start gap-3 rounded-lg border border-danger/40 bg-canvas/90 p-5 backdrop-blur">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" />
            <div>
              <p className="font-medium text-ink">Playback issue</p>
              <p className="mt-1 text-label text-ink-subtle">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
