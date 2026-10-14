// Shared state between the playback wrapper (controls.tsx), the workspace
// control protocol (workspaceControls.ts), and the useVideoPlayer hook.
// Module-level so the controls work with any VideoTemplate that calls
// useVideoPlayer -- no props are threaded through the video component. Only
// the iframed preview mutates this state; the export path keeps the defaults
// below, so exported playback is untouched.

export interface ScenePlayback {
  sceneKeys: string[];
  durationsMs: number[];
}

export interface PlayerBridgeState {
  /** Scene index a freshly mounted player starts from (preview jumps). */
  startIndex: number;
  paused: boolean;
  /** Replay the current scene instead of advancing (preview scene-lock). */
  locked: boolean;
  /**
   * Bumped when a locked scene finishes playing; the control wrapper
   * remounts the player so the scene replays from its first frame.
   */
  loopEpoch: number;
  /**
   * Bumped when a control action (scene jump, lock toggle) needs the player
   * remounted to take effect.
   */
  remountEpoch: number;
  playback: ScenePlayback | null;
  currentIndex: number;
  /** null until an audio layer registers through useVideoAudio. */
  audioMuted: boolean | null;
  /** True while the workspace holds the claim (see workspaceControls.ts). */
  workspaceOwned: boolean;
  /** True while the scaffold's placeholder scene is mounted (useVideoPlaceholder). */
  placeholderMounted: boolean;
  /**
   * The playback registered while the placeholder scene was mounted. Vite
   * Fast Refresh keeps useVideoPlayer's captured durations and re-runs its
   * effects after the scene is gone, so the placeholder is recognized by
   * content (see isPlaceholderPlayback), not by mount state.
   */
  placeholderPlayback: ScenePlayback | null;
}

const INITIAL_STATE: PlayerBridgeState = {
  startIndex: 0,
  paused: false,
  locked: false,
  loopEpoch: 0,
  remountEpoch: 0,
  playback: null,
  currentIndex: 0,
  audioMuted: null,
  workspaceOwned: false,
  placeholderMounted: false,
  placeholderPlayback: null,
};

/** Whether the current playback is the scaffold placeholder's, not a video. */
export function isPlaceholderPlayback(state: PlayerBridgeState): boolean {
  const { playback, placeholderPlayback } = state;
  if (playback === null || placeholderPlayback === null) {
    return false;
  }
  return (
    playback.sceneKeys.length === placeholderPlayback.sceneKeys.length &&
    playback.sceneKeys.every(
      (key, index) =>
        key === placeholderPlayback.sceneKeys[index] &&
        playback.durationsMs[index] === placeholderPlayback.durationsMs[index],
    )
  );
}

let state = INITIAL_STATE;
const listeners = new Set<() => void>();

function commit(next: PlayerBridgeState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export const playerBridge = {
  getState(): PlayerBridgeState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setStartIndex(startIndex: number) {
    if (state.startIndex !== startIndex) {
      commit({ ...state, startIndex });
    }
  },

  setPaused(paused: boolean) {
    if (state.paused !== paused) {
      commit({ ...state, paused });
    }
  },

  setLocked(locked: boolean) {
    if (state.locked !== locked) {
      commit({ ...state, locked });
    }
  },

  bumpLoopEpoch() {
    commit({ ...state, loopEpoch: state.loopEpoch + 1 });
  },

  bumpRemountEpoch() {
    commit({ ...state, remountEpoch: state.remountEpoch + 1 });
  },

  setWorkspaceOwned(workspaceOwned: boolean) {
    if (state.workspaceOwned !== workspaceOwned) {
      commit({ ...state, workspaceOwned });
    }
  },

  setPlaceholderMounted(placeholderMounted: boolean) {
    if (state.placeholderMounted === placeholderMounted) {
      return;
    }
    // Tag the current playback too, so the result does not depend on whether
    // the placeholder scene or the player registers first.
    commit({
      ...state,
      placeholderMounted,
      placeholderPlayback:
        placeholderMounted && state.playback !== null
          ? state.playback
          : state.placeholderPlayback,
    });
  },

  registerPlayback(playback: ScenePlayback) {
    commit({
      ...state,
      playback,
      placeholderPlayback: state.placeholderMounted
        ? playback
        : state.placeholderPlayback,
      currentIndex: Math.min(
        state.currentIndex,
        Math.max(0, playback.sceneKeys.length - 1),
      ),
    });
  },

  publishSceneIndex(currentIndex: number) {
    if (state.currentIndex !== currentIndex) {
      commit({ ...state, currentIndex });
    }
  },

  registerAudio() {
    if (state.audioMuted === null) {
      commit({ ...state, audioMuted: false });
    }
  },

  setAudioMuted(audioMuted: boolean) {
    if (state.audioMuted !== null && state.audioMuted !== audioMuted) {
      commit({ ...state, audioMuted });
    }
  },

  /** Restores the defaults. Used by tests. */
  reset() {
    commit(INITIAL_STATE);
  },
};
