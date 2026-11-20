import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { Camera, CircleAlert, FileImage, RotateCcw, Square, Upload, X } from "lucide-react";

function usePageExit(release: () => void, reset: () => void) {
  const handlers = useRef({ release, reset });
  useEffect(() => { handlers.current = { release, reset }; }, [release, reset]);
  useEffect(() => {
    const leave = () => {
      handlers.current.release();
      handlers.current.reset();
    };
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      handlers.current.release();
    };
  }, []);
}

function EmptyPreview({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="preview-empty">{icon}<p>{children}</p></div>;
}

function PreviewNotice({ error, onSample }: { error?: string; onSample: () => void }) {
  return (
    <div className="media-notice">
      {error && <p className="media-error" role="alert"><CircleAlert size={17} aria-hidden="true" />{error}</p>}
      <div className="media-notice-row">
        <div><strong>Model unavailable</strong><p>Preview only. Media stays in this browser.</p></div>
        <button className="button button--secondary" type="button" onClick={onSample}>Try a sample</button>
      </div>
    </div>
  );
}

type CameraState = "off" | "starting" | "on";
const cameraErrors: Record<string, string> = {
  NotAllowedError: "Camera access was denied. Allow access in your browser settings or try a sample.",
  NotFoundError: "No camera was found. Connect a camera or try a sample.",
  NotReadableError: "The camera is unavailable or in use. Close other camera apps and try again.",
  AbortError: "The camera could not start. Try again or try a sample.",
  SecurityError: "Camera access is blocked. Open the demo on HTTPS or localhost, or try a sample.",
  OverconstrainedError: "No camera supports the requested settings. Try a sample.",
};

export function WebcamPreview({ onSample }: { onSample: () => void }) {
  const stream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const request = useRef(0);
  const [state, setState] = useState<CameraState>("off");
  const [error, setError] = useState<string>();

  function release() {
    request.current++;
    stream.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    stream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  usePageExit(release, () => setState("off"));

  useEffect(() => {
    if (state === "on" && videoRef.current) videoRef.current.srcObject = stream.current;
  }, [state]);

  async function startCamera() {
    setError(undefined);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access requires a supported browser on HTTPS or localhost. Try a sample.");
      return;
    }

    const id = ++request.current;
    setState("starting");
    try {
      const incoming = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (id !== request.current) {
        incoming.getTracks().forEach((track) => track.stop());
        return;
      }

      stream.current = incoming;
      incoming.getVideoTracks().forEach((track) => {
        track.onended = () => {
          release();
          setState("off");
          setError("Camera disconnected. Reconnect it or try a sample.");
        };
      });
      setState("on");
    } catch (cause) {
      if (id !== request.current) return;
      setState("off");
      setError(cameraErrors[cause instanceof Error ? cause.name : ""] ?? "The camera could not start. Check the connection or try a sample.");
    }
  }

  return (
    <>
      <div className="preview-stage">
        {state === "on" ? (
          <video ref={videoRef} autoPlay muted playsInline aria-label="Local webcam preview" onError={() => {
            release();
            setState("off");
            setError("The camera preview could not be displayed. Try restarting it or try a sample.");
          }} />
        ) : (
          <EmptyPreview icon={<Camera size={30} aria-hidden="true" />}>
            {state === "starting" ? "Waiting for camera access…" : "Camera preview is off"}
          </EmptyPreview>
        )}
      </div>
      <div className="preview-controls">
        <span className={state === "on" ? "camera-status camera-status--on" : "camera-status"} role="status">
          {state === "on" ? "Camera on" : state === "starting" ? "Requesting camera access" : "Camera off"}
        </span>
        {state === "off" ? (
          <button type="button" className="button button--primary" onClick={startCamera}><Camera size={16} aria-hidden="true" /> Start camera</button>
        ) : (
          <button type="button" className="button button--secondary" onClick={() => { release(); setState("off"); }}>
            <Square size={15} aria-hidden="true" /> {state === "on" ? "Stop camera" : "Cancel"}
          </button>
        )}
      </div>
      <PreviewNotice error={error} onSample={onSample} />
    </>
  );
}

const extensions = { jpg: "image", jpeg: "image", png: "image", webp: "image", mp4: "video", webm: "video" } as const;
const mimeTypes = {
  "image/jpeg": "image", "image/png": "image", "image/webp": "image", "video/mp4": "video", "video/webm": "video",
} as const;

type MediaType = "image" | "video";
type LocalMedia = { url: string; name: string; type: MediaType };

export function UploadPreview({ onSample }: { onSample: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const urlRef = useRef<string | null>(null);
  const [media, setMedia] = useState<LocalMedia>();
  const [error, setError] = useState<string>();

  function release() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }

  usePageExit(release, () => setMedia(undefined));

  function removeFile() {
    release();
    setMedia(undefined);
    setError(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    removeFile();
    const extension = file.name.split(".").pop()?.toLowerCase();
    const type = mimeTypes[file.type as keyof typeof mimeTypes]
      ?? (extension && extensions[extension as keyof typeof extensions]);

    if (!type || file.size === 0) {
      setError("Choose a non-empty JPG, PNG, WebP, MP4 or WebM file.");
      return;
    }

    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setMedia({ url, name: file.name, type });
  }

  function decodeFailed(url: string) {
    if (url !== urlRef.current) return;
    removeFile();
    setError("This file couldn’t be displayed. Try a different file or try a sample.");
  }

  return (
    <>
      <div className="preview-stage">
        {media?.type === "image" && (
          <img key={media.url} src={media.url} alt="Preview of the selected image" onError={() => decodeFailed(media.url)} />
        )}
        {media?.type === "video" && (
          <video key={media.url} src={media.url} controls playsInline preload="metadata" aria-label="Preview of the selected video" onError={() => decodeFailed(media.url)} />
        )}
        {!media && <EmptyPreview icon={<FileImage size={30} aria-hidden="true" />}>Choose an image or video to preview</EmptyPreview>}
      </div>
      <div className="preview-controls upload-controls">
        <div className="upload-copy">
          {media && <strong className="filename" title={media.name}>{media.name}</strong>}
          <p id="upload-formats">JPG, PNG, WebP, MP4 or WebM</p>
        </div>
        <input
          ref={inputRef}
          className="visually-hidden-file"
          type="file"
          tabIndex={-1}
          accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
          aria-label="Upload an image or video"
          aria-describedby="upload-formats"
          onChange={chooseFile}
        />
        <div className="upload-buttons">
          {media && <button type="button" className="button button--secondary" onClick={() => {
            removeFile();
            chooseRef.current?.focus();
          }}><X size={16} aria-hidden="true" /> Remove</button>}
          <button ref={chooseRef} type="button" className="button button--primary" aria-describedby="upload-formats" onClick={() => inputRef.current?.click()}>
            {media ? <RotateCcw size={16} aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
            {media ? "Replace file" : "Choose file"}
          </button>
        </div>
      </div>
      <PreviewNotice error={error} onSample={onSample} />
    </>
  );
}
