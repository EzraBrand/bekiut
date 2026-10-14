// Player control actions behind the workspace control protocol
// (workspaceControls.ts). Everything drives playback through the bridge so
// useVideoPlayer stays the single scene clock.

import { SCENE_DETAILS } from '../../components/video/sceneMeta';
import { playerBridge } from './playerBridge';

export function announceSceneSelection(index: number, sceneKeys: string[]) {
  const key = sceneKeys[index];
  const details = SCENE_DETAILS[key];
  // The workspace rejects selections without a source locator.
  if (!details?.filePath) return;
  window.parent.postMessage(
    {
      type: 'REPLIT_VIDEO_SCENE_SELECTED',
      payload: {
        sceneIndex: index,
        sceneCount: sceneKeys.length,
        sceneTitle: details.title || key,
        filePath: details.filePath,
        lineNumber: 1,
      },
    },
    '*',
  );
}

export function jumpToScene(index: number) {
  const { playback } = playerBridge.getState();
  const sceneKeys = playback?.sceneKeys ?? [];
  if (!Number.isInteger(index) || index < 0 || index >= sceneKeys.length) {
    return;
  }
  playerBridge.setStartIndex(index);
  playerBridge.setPaused(false);
  playerBridge.bumpRemountEpoch();
  announceSceneSelection(index, sceneKeys);
}

export function setSceneLock(locked: boolean) {
  const state = playerBridge.getState();
  if (state.locked === locked) {
    return;
  }
  // Lock and unlock both restart the active scene so the loop boundary is
  // never mid-scene.
  playerBridge.setLocked(locked);
  playerBridge.setStartIndex(state.currentIndex);
  playerBridge.setPaused(false);
  playerBridge.bumpRemountEpoch();
}

export function setPaused(paused: boolean) {
  playerBridge.setPaused(paused);
}

export function setAudioMuted(muted: boolean) {
  playerBridge.setAudioMuted(muted);
}
