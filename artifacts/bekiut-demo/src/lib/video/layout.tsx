import {
  createContext,
  createElement,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactElement,
} from 'react';

export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

type VideoOrientation = 'landscape' | 'portrait' | 'square';

interface VideoLayoutConfig {
  orientation: VideoOrientation;
  safeBlock: CSSProperties['paddingBlock'];
  safeInline: CSSProperties['paddingInline'];
  splitDirection: CSSProperties['flexDirection'];
  sceneGap: CSSProperties['gap'];
}

const VIDEO_LAYOUTS: Record<VideoAspectRatio, VideoLayoutConfig> = {
  '16:9': {
    orientation: 'landscape',
    safeBlock: '5vmin',
    safeInline: '6vmin',
    splitDirection: 'row',
    sceneGap: '6vmin',
  },
  '9:16': {
    orientation: 'portrait',
    safeBlock: '12vmin',
    safeInline: '6vmin',
    splitDirection: 'column',
    sceneGap: '5vmin',
  },
  '1:1': {
    orientation: 'square',
    safeBlock: '7vmin',
    safeInline: '7vmin',
    splitDirection: 'column',
    sceneGap: '5vmin',
  },
  '4:5': {
    orientation: 'portrait',
    safeBlock: '9vmin',
    safeInline: '7vmin',
    splitDirection: 'column',
    sceneGap: '5vmin',
  },
};

interface VideoLayoutContextValue extends VideoLayoutConfig {
  aspectRatio: VideoAspectRatio;
}

const VideoLayoutContext = createContext<VideoLayoutContextValue | null>(null);

export function useVideoLayout(): VideoLayoutContextValue {
  const layout = useContext(VideoLayoutContext);
  if (layout === null) {
    throw new Error('Video layout primitives must be inside VideoCanvas');
  }

  return layout;
}

interface VideoCanvasProps
  extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  aspectRatio: VideoAspectRatio;
}

export function VideoCanvas({
  aspectRatio,
  children,
  style,
  ...props
}: VideoCanvasProps): ReactElement {
  const layout = VIDEO_LAYOUTS[aspectRatio];

  return (
    <VideoLayoutContext.Provider value={{ aspectRatio, ...layout }}>
      <div
        {...props}
        data-video-aspect-ratio={aspectRatio}
        data-video-orientation={layout.orientation}
        style={{
          ...style,
          boxSizing: 'border-box',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </VideoLayoutContext.Provider>
  );
}

export function SafeFrame({
  children,
  style,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>): ReactElement {
  const { safeBlock, safeInline } = useVideoLayout();

  return (
    <div
      {...props}
      style={{
        ...style,
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        paddingBlock: safeBlock,
        paddingInline: safeInline,
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}

type SceneLayoutKind = 'center' | 'split' | 'stack';

interface SceneLayoutProps
  extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  layout?: SceneLayoutKind;
}

export function SceneLayout({
  children,
  layout = 'center',
  style,
  ...props
}: SceneLayoutProps): ReactElement {
  const { sceneGap, splitDirection } = useVideoLayout();
  const flexDirection = layout === 'split' ? splitDirection : 'column';
  const alignItems = layout === 'stack' ? 'stretch' : 'center';

  return (
    <div
      {...props}
      data-scene-layout={layout}
      style={{
        ...style,
        alignItems,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection,
        gap: sceneGap,
        height: '100%',
        justifyContent: 'center',
        minHeight: 0,
        minWidth: 0,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

type VideoTextElement = 'h1' | 'h2' | 'p' | 'span';
type VideoTextScale = 'display' | 'heading' | 'body' | 'caption';

const VIDEO_TEXT_STYLES: Record<VideoTextScale, CSSProperties> = {
  display: {
    fontSize: 'clamp(3rem, 12vmin, 10rem)',
    lineHeight: 0.9,
    margin: 0,
  },
  heading: {
    fontSize: 'clamp(2rem, 7vmin, 6rem)',
    lineHeight: 1,
    margin: 0,
  },
  body: {
    fontSize: 'clamp(1rem, 2.8vmin, 2.5rem)',
    lineHeight: 1.35,
    margin: 0,
  },
  caption: {
    fontSize: 'clamp(0.75rem, 1.8vmin, 1.5rem)',
    lineHeight: 1.3,
    margin: 0,
  },
};

interface VideoTextProps extends HTMLAttributes<HTMLElement> {
  as?: VideoTextElement;
  scale?: VideoTextScale;
}

export function VideoText({
  as = 'p',
  scale = 'body',
  style,
  ...props
}: VideoTextProps): ReactElement {
  return createElement(as, {
    ...props,
    'data-video-text-scale': scale,
    style: { ...VIDEO_TEXT_STYLES[scale], ...style },
  });
}

type MediaFit = 'cover' | 'contain';
type MediaPosition = 'center' | 'top' | 'right' | 'bottom' | 'left';

interface MediaFrameProps
  extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  fit?: MediaFit;
  position?: MediaPosition;
}

export function MediaFrame({
  children,
  className,
  fit = 'cover',
  position = 'center',
  ...props
}: MediaFrameProps): ReactElement {
  return (
    <div
      {...props}
      className={['video-media-frame', className].filter(Boolean).join(' ')}
      data-media-fit={fit}
      data-media-position={position}
    >
      {children}
    </div>
  );
}
