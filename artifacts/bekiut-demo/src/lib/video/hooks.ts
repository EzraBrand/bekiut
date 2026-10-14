// Video player hook - handles recording lifecycle, scene advancement, and looping

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { playerBridge } from './playerBridge';

declare global {
  interface Window {
    __replitVideoPlayerMounted?: boolean;
    __replitVideoTotalDurationMs?: number;
    startRecording?: () => Promise<void>;
    stopRecording?: () => void;
  }
}

export interface SceneDurations {
  [key: string]: number;
}

// Lets in-scene timers (useSceneTimer) freeze without threading a prop
// through every scene component. The export path never provides it, so
// exports always play through.
export const VideoPausedContext = createContext(false);

export interface UseVideoPlayerOptions {
  durations: SceneDurations;
  onVideoEnd?: () => void;
  loop?: boolean;
  paused?: boolean;
}

export interface UseVideoPlayerReturn {
  currentScene: number;
  totalScenes: number;
  currentSceneKey: string;
  hasEnded: boolean;
}

export function useVideoPlayer(
  options: UseVideoPlayerOptions,
): UseVideoPlayerReturn {
  const { durations, onVideoEnd, loop = true, paused: pausedOption = false } =
    options;

  // Captured once on mount -- durations must be a static object
  const sceneKeys = useRef(Object.keys(durations)).current;
  const totalScenes = sceneKeys.length;
  const durationsArray = useRef(Object.values(durations)).current;

  const bridgeState = useSyncExternalStore(
    playerBridge.subscribe,
    playerBridge.getState,
    playerBridge.getState,
  );
  const paused = pausedOption || bridgeState.paused;

  // The preview control bar jumps to a scene by remounting the player with a
  // new start index. Nothing mutates the bridge in the export path, so
  // exports always start at scene 0.
  const [currentScene, setCurrentScene] = useState(() => {
    const { startIndex } = playerBridge.getState();
    return startIndex > 0 && startIndex < sceneKeys.length ? startIndex : 0;
  });
  const [hasEnded, setHasEnded] = useState(false);
  // Time left in the current scene, carried across pause/resume cycles
  const remainingMsRef = useRef<number | null>(null);

  // Start recording on mount
  useEffect(() => {
    window.__replitVideoPlayerMounted = true;
    // Declares the intended video length to the export renderer so a broken
    // stop path cannot record past the end of the last scene.
    window.__replitVideoTotalDurationMs = durationsArray.reduce(
      (total, duration) => total + duration,
      0,
    );
    window.startRecording?.();

    return () => {
      window.__replitVideoPlayerMounted = false;
    };
  }, []);

  useEffect(() => {
    playerBridge.registerPlayback({ sceneKeys, durationsMs: durationsArray });
  }, [sceneKeys, durationsArray]);

  useEffect(() => {
    playerBridge.publishSceneIndex(currentScene);
  }, [currentScene]);

  // Scene advancement -- loops independently of recording
  useEffect(() => {
    if (paused || (hasEnded && !loop)) return;

    const currentDuration =
      remainingMsRef.current ?? durationsArray[currentScene];
    const startedAt = performance.now();
    let fired = false;

    const timer = setTimeout(() => {
      fired = true;
      // Preview scene-lock: replay this scene via a control-wrapper remount
      // instead of advancing. Never true in the export path, where nothing
      // mutates the bridge.
      if (playerBridge.getState().locked) {
        playerBridge.bumpLoopEpoch();
        return;
      }
      // Last scene just finished playing
      if (currentScene >= totalScenes - 1) {
        if (!hasEnded) {
          window.stopRecording?.();
          setHasEnded(true);
          onVideoEnd?.();
        }
        if (loop) {
          setCurrentScene(0);
        }
      } else {
        setCurrentScene((prev) => prev + 1);
      }
    }, currentDuration);

    return () => {
      clearTimeout(timer);
      // Only carry leftover time when interrupted mid-scene (pause); a scene
      // that advanced normally must not shorten the next one.
      remainingMsRef.current = fired
        ? null
        : Math.max(0, currentDuration - (performance.now() - startedAt));
    };
  }, [
    currentScene,
    totalScenes,
    durationsArray,
    hasEnded,
    loop,
    onVideoEnd,
    paused,
  ]);

  return {
    currentScene,
    totalScenes,
    currentSceneKey: sceneKeys[currentScene],
    hasEnded,
  };
}

export interface VideoAudioState {
  muted: boolean;
  /** Mirrors the scene clock so the audio element can pause in step with it. */
  paused: boolean;
}

/**
 * Playback state for a background audio layer. Registering makes the
 * workspace control bar show its mute button; the export path never mutes or
 * pauses because the bar (the only writer) is absent there.
 */
export function useVideoAudio(): VideoAudioState {
  const bridgeState = useSyncExternalStore(
    playerBridge.subscribe,
    playerBridge.getState,
    playerBridge.getState,
  );

  useEffect(() => {
    playerBridge.registerAudio();
  }, []);

  return {
    muted: bridgeState.audioMuted ?? false,
    paused: bridgeState.paused,
  };
}

/**
 * Marks the scaffold's placeholder scene. The playback registered while it
 * is mounted is published to the workspace as "no scenes", so the control
 * bar stays hidden until real scenes replace the placeholder. Only
 * ReplitLoadingScene calls this.
 */
export function useVideoPlaceholder() {
  useEffect(() => {
    playerBridge.setPlaceholderMounted(true);
    return () => {
      playerBridge.setPlaceholderMounted(false);
    };
  }, []);
}

export function useSceneTimer(
  events: Array<{ time: number; callback: () => void }>,
) {
  const paused = useContext(VideoPausedContext);
  const firedRef = useRef<Set<number>>(new Set());
  const callbacksRef = useRef<Array<() => void>>([]);
  const elapsedMsRef = useRef(0);

  useEffect(() => {
    callbacksRef.current = events.map((e) => e.callback);
  }, [events]);

  const scheduleKey = events.map((event, i) => `${i}:${event.time}`).join('|');

  useEffect(() => {
    firedRef.current = new Set();
    elapsedMsRef.current = 0;
  }, [scheduleKey]);

  useEffect(() => {
    if (paused) return;

    const startedAt = performance.now();
    const timers = events.map(({ time }, index) => {
      return setTimeout(
        () => {
          if (!firedRef.current.has(index)) {
            firedRef.current.add(index);
            callbacksRef.current[index]?.();
          }
        },
        Math.max(0, time - elapsedMsRef.current),
      );
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      elapsedMsRef.current += performance.now() - startedAt;
    };
  }, [scheduleKey, paused]);
}
