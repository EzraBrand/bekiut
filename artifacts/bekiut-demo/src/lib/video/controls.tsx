// Playback wrapper for videos whose control bar the Replit workspace renders
// outside the iframe. Renders no UI of its own: it remounts the player for
// scene jumps and lock replays, freezes DOM animations while paused, and
// connects the workspace's control bar over postMessage (see
// workspaceControls.ts). Only active inside an iframe (the preview pane); as
// the top-level document — the export path — it renders its children
// untouched. The scaffold does not mount it: the scene-controls reference
// says whether to wrap VideoTemplate with it in App.tsx.

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';

import { VideoPausedContext } from './hooks';
import { playerBridge } from './playerBridge';
import { installWorkspaceControls } from './workspaceControls';

export function WorkspaceControlledVideo({ children }: { children: ReactNode }) {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;
  if (!isIframed) {
    return <>{children}</>;
  }
  return <ControlledVideo>{children}</ControlledVideo>;
}

function ControlledVideo({ children }: { children: ReactNode }) {
  const { paused, loopEpoch, remountEpoch } = useSyncExternalStore(
    playerBridge.subscribe,
    playerBridge.getState,
    playerBridge.getState,
  );

  useEffect(() => installWorkspaceControls(), []);

  // Freeze in-flight DOM animations: CSS animations/transitions and WAAPI,
  // which covers framer-motion's transform/opacity tweens. Resume only the
  // ones this effect paused so finished animations don't restart. The scene
  // clock and useSceneTimer events freeze separately via the bridge and
  // VideoPausedContext.
  useEffect(() => {
    if (!paused || typeof document.getAnimations !== 'function') return;
    const frozen = document
      .getAnimations()
      .filter((animation) => animation.playState === 'running');
    frozen.forEach((animation) => animation.pause());
    return () => frozen.forEach((animation) => animation.play());
  }, [paused]);

  return (
    <VideoPausedContext.Provider value={paused}>
      <div key={`${remountEpoch}:${loopEpoch}`} className="w-full h-full">
        {children}
      </div>
    </VideoPausedContext.Provider>
  );
}
