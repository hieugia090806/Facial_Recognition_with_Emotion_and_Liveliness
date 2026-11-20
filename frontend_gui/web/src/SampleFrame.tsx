import { useEffect, useRef, useState } from "react";
import { ImageOff, ScanFace } from "lucide-react";
import { identityLabel, sampleUrl } from "./analysis";
import type { AnalysisResult, Sample } from "./analysis";

type ImageSize = { width: number; height: number };

export function SampleFrame({ sample, result, illustrative = false }: {
  sample: Sample;
  result?: AnalysisResult;
  illustrative?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ImageSize>();
  const [failed, setFailed] = useState(false);
  const { image } = sample;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const fit = ({ width, height }: ImageSize) => {
      const scale = Math.min(width / image.width, height / image.height);
      setSize({ width: image.width * scale, height: image.height * scale });
    };
    fit(stage.getBoundingClientRect());
    const resize = new ResizeObserver(([entry]) => {
      if (entry) fit(entry.contentRect);
    });
    resize.observe(stage);
    return () => resize.disconnect();
  }, [image.width, image.height]);

  const face = result?.kind === "face" ? result.face : undefined;
  const box = face?.bounds;
  const liveness = result?.kind === "face" ? result.liveness?.status : undefined;
  const boxTone = liveness === "spoof" ? " face-box--alert"
    : liveness === "live" || illustrative ? "" : " face-box--warning";
  const label = illustrative ? "Face region" : result && identityLabel(result);
  const percent = (value: number) => value * 100 + "%";

  return (
    <div className={illustrative ? "sample-frame hero-frame" : "preview-stage sample-frame"} ref={stageRef}>
      {failed ? (
        <div className="preview-empty">
          <ImageOff aria-hidden="true" size={28} />
          <p>Sample image unavailable</p>
        </div>
      ) : (
        <img
          src={sampleUrl(sample)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          fetchPriority={illustrative ? "high" : "auto"}
          onError={() => setFailed(true)}
        />
      )}
      {size && box && !failed && (
        <div className="overlay-frame" style={size} aria-hidden="true">
          <div
            className={"face-box" + boxTone}
            style={{ left: percent(box.x), top: percent(box.y), width: percent(box.width), height: percent(box.height) }}
          >
            <i /><i /><i /><i />
            {label && <span className="face-box-label">{label}</span>}
          </div>
          {face.landmarks?.map((point) => (
            <span className="landmark" key={point.x + ":" + point.y} style={{ left: percent(point.x), top: percent(point.y) }} />
          ))}
          {illustrative && <div className="viewfinder-grid" />}
        </div>
      )}
      {result?.kind === "no-face" && (
        <div className="preview-message"><ScanFace size={16} aria-hidden="true" /> No face detected</div>
      )}
    </div>
  );
}
