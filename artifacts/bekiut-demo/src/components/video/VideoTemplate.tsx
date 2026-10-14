import { useEffect, useRef } from 'react';
import {
  VideoCanvas,
  VideoPausedContext,
  type VideoAspectRatio,
  useVideoPlayer,
} from '@/lib/video';
import { AnimatePresence } from 'framer-motion';

import { HookScene } from './scenes/HookScene';
import { LibraryScene } from './scenes/LibraryScene';
import { DictionaryScene } from './scenes/DictionaryScene';
import { ToolsScene } from './scenes/ToolsScene';
import { PlacesScene } from './scenes/PlacesScene';
import { LockupScene } from './scenes/LockupScene';

export const SCENE_DURATIONS = {
  hook: 4500,
  library: 6500,
  dictionary: 5500,
  tools: 6000,
  places: 4000,
  lockup: 3500,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  hook: HookScene,
  library: LibraryScene,
  dictionary: DictionaryScene,
  tools: ToolsScene,
  places: PlacesScene,
  lockup: LockupScene,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let ms = 0;
  for (const [k, d] of Object.entries(SCENE_DURATIONS)) {
    out[k] = ms / 1000;
    ms += d;
  }
  return out;
})();

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '16:9';
const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  paused = false,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop, paused });
  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSceneKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;
    if (paused) {
      audio.pause();
      return;
    }
    if (lastSceneKeyRef.current !== currentSceneKey) {
      lastSceneKeyRef.current = currentSceneKey;
      const target = SCENE_START_SEC[baseSceneKey] ?? 0;
      if (Math.abs(audio.currentTime - target) > AUDIO_SEEK_EPSILON_SEC) {
        audio.currentTime = target;
      }
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted, paused]);

  return (
    <VideoPausedContext.Provider value={paused}>
      <VideoCanvas aspectRatio={VIDEO_ASPECT_RATIO} style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <AnimatePresence mode="popLayout">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
        <audio
          ref={audioRef}
          src={`${import.meta.env.BASE_URL}audio/composite_audio.mp3`}
          preload="auto"
          autoPlay
          muted={muted}
        />
      </VideoCanvas>
    </VideoPausedContext.Provider>
  );
}
