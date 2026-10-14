// Lets the Replit workspace render the video control bar outside the iframe.
// The workspace claims ownership over postMessage and drives playback through
// the player actions; the runtime echoes the claim in its published state so
// the workspace can re-claim after in-iframe navigations and restarts.

import { SCENE_DETAILS } from '../../components/video/sceneMeta';
import { jumpToScene, setAudioMuted, setPaused, setSceneLock } from './playerActions';
import {
  isPlaceholderPlayback,
  playerBridge,
  type PlayerBridgeState,
} from './playerBridge';

export const VIDEO_CONTROLS_PROTOCOL_VERSION = 1;

export const VIDEO_PLAYER_STATE_MESSAGE_TYPE = 'REPLIT_VIDEO_PLAYER_STATE';
export const VIDEO_CONTROLS_CLAIM_MESSAGE_TYPE = 'REPLIT_VIDEO_CONTROLS_CLAIM';
export const VIDEO_CONTROLS_COMMAND_MESSAGE_TYPE =
  'REPLIT_VIDEO_CONTROLS_COMMAND';

export interface VideoPlayerSceneState {
  key: string;
  title: string;
  durationMs: number;
}

export interface VideoPlayerStatePayload {
  protocolVersion: number;
  scenes: Array<VideoPlayerSceneState>;
  currentIndex: number;
  paused: boolean;
  locked: boolean;
  /** null when no audio layer has registered. */
  audioMuted: boolean | null;
  /**
   * Increments whenever the player remounts (scene jump, lock toggle, or a
   * locked-scene replay). The workspace resets its per-scene progress clock
   * when this changes.
   */
  playbackEpoch: number;
  /**
   * Whether this runtime currently honors a workspace claim. The workspace
   * re-claims whenever it sees unowned state, which survives navigations
   * and runtime restarts inside the same iframe (the contentWindow identity
   * does not change, so the workspace cannot detect those itself).
   */
  workspaceOwned: boolean;
}

export type VideoControlsCommand =
  | { command: 'setPaused'; paused: boolean }
  | { command: 'jumpToScene'; sceneIndex: number }
  | { command: 'setSceneLock'; locked: boolean }
  | { command: 'setAudioMuted'; muted: boolean };

// Workspace hosts that may claim the controls, including their subdomains:
// canary/staging previews (alpha-staging.replit.com) and True Staging
// (*.replit-staging.com) serve the workspace from subdomains.
const TRUSTED_WORKSPACE_HOSTS = [
  'replit.com',
  'replit-staging.com',
  'firewalledreplit.com',
];
// Dev VMs serve the workspace from the Replit tailnet on port 3000.
const DEV_VM_HOST_SUFFIX = '.tail0a469.ts.net';
const DEV_VM_WORKSPACE_PORT = '3000';

function isTrustedWorkspaceHostname(hostname: string): boolean {
  return TRUSTED_WORKSPACE_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );
}

export function isTrustedWorkspaceOrigin(origin: string): boolean {
  // The repl shield wraps previews in a same-origin frame that relays the
  // workspace's messages, so relayed claims and commands arrive carrying
  // the artifact's own origin instead of the workspace's. Trusting it only
  // exposes preview playback control, same as the relay already carries
  // for scene-selection announcements.
  if (origin === window.location.origin) {
    return true;
  }

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  const { hostname, port, protocol } = url;

  if (
    protocol === 'http:' &&
    (hostname === 'localhost' || hostname === '127.0.0.1')
  ) {
    return true;
  }
  if (hostname.endsWith(DEV_VM_HOST_SUFFIX) && port === DEV_VM_WORKSPACE_PORT) {
    return true;
  }

  return (
    protocol === 'https:' &&
    (isTrustedWorkspaceHostname(hostname) ||
      (hostname.startsWith('web--') && hostname.endsWith('.z.zergrush.dev')))
  );
}

function toStatePayload(state: PlayerBridgeState): VideoPlayerStatePayload {
  // The placeholder is not a video yet, so the workspace gets nothing to
  // control until the agent's real scenes replace it.
  const playback = isPlaceholderPlayback(state) ? null : state.playback;
  const sceneKeys = playback?.sceneKeys ?? [];
  const durationsMs = playback?.durationsMs ?? [];

  return {
    protocolVersion: VIDEO_CONTROLS_PROTOCOL_VERSION,
    scenes: sceneKeys.map((key, index) => ({
      key,
      title: SCENE_DETAILS[key]?.title || key,
      durationMs: durationsMs[index] ?? 0,
    })),
    currentIndex: state.currentIndex,
    paused: state.paused,
    locked: state.locked,
    audioMuted: state.audioMuted,
    playbackEpoch: state.remountEpoch + state.loopEpoch,
    workspaceOwned: state.workspaceOwned,
  };
}

function publishState() {
  window.parent.postMessage(
    {
      type: VIDEO_PLAYER_STATE_MESSAGE_TYPE,
      payload: toStatePayload(playerBridge.getState()),
    },
    '*',
  );
}

function handleCommand(command: VideoControlsCommand) {
  switch (command.command) {
    case 'setPaused':
      setPaused(command.paused);
      break;
    case 'jumpToScene':
      jumpToScene(command.sceneIndex);
      break;
    case 'setSceneLock':
      setSceneLock(command.locked);
      break;
    case 'setAudioMuted':
      setAudioMuted(command.muted);
      break;
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }
}

function parseCommand(payload: unknown): VideoControlsCommand | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }
  const data = payload as Record<string, unknown>;
  switch (data.command) {
    case 'setPaused':
      return typeof data.paused === 'boolean'
        ? { command: 'setPaused', paused: data.paused }
        : null;
    case 'jumpToScene':
      return Number.isInteger(data.sceneIndex)
        ? { command: 'jumpToScene', sceneIndex: data.sceneIndex as number }
        : null;
    case 'setSceneLock':
      return typeof data.locked === 'boolean'
        ? { command: 'setSceneLock', locked: data.locked }
        : null;
    case 'setAudioMuted':
      return typeof data.muted === 'boolean'
        ? { command: 'setAudioMuted', muted: data.muted }
        : null;
    default:
      return null;
  }
}

/**
 * Starts publishing player state to the workspace and handling its claim and
 * command messages. Returns a cleanup that also releases the claim so a
 * remounted runtime starts unowned and the workspace re-claims it.
 */
export function installWorkspaceControls(): () => void {
  const handleMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) {
      return;
    }
    if (!isTrustedWorkspaceOrigin(event.origin)) {
      return;
    }
    const data = event.data as { type?: unknown; payload?: unknown } | null;
    if (typeof data !== 'object' || data === null) {
      return;
    }

    if (data.type === VIDEO_CONTROLS_CLAIM_MESSAGE_TYPE) {
      const payload = data.payload as { claimed?: unknown } | undefined;
      if (typeof payload?.claimed === 'boolean') {
        // setWorkspaceOwned commits (and therefore publishes) only on a
        // real transition, so repeated claims cannot ping-pong with the
        // workspace's claim-on-unowned-state rule.
        playerBridge.setWorkspaceOwned(payload.claimed);
      }
      return;
    }

    if (data.type === VIDEO_CONTROLS_COMMAND_MESSAGE_TYPE) {
      const command = parseCommand(data.payload);
      if (command !== null) {
        handleCommand(command);
      }
    }
  };

  window.addEventListener('message', handleMessage);
  const unsubscribe = playerBridge.subscribe(publishState);
  publishState();

  return () => {
    window.removeEventListener('message', handleMessage);
    unsubscribe();
    playerBridge.setWorkspaceOwned(false);
  };
}
