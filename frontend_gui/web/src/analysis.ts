export type Bounds = Readonly<{ x: number; y: number; width: number; height: number }>;
export type Point = Readonly<{ x: number; y: number }>;

type Face = {
  /** Coordinates in the original, unmirrored image, normalized to 0–1. */
  bounds: Bounds;
  landmarks?: readonly Point[];
};

type Score = {
  value: number;
  unit: "probability" | "cosine";
};

type Liveness = {
  status: "live" | "spoof" | "inconclusive";
  confidence?: Score;
};

type Identity =
  | { status: "matched"; name: string; similarity?: Score }
  | { status: "unknown"; similarity?: Score };

export type AnalysisResult = (
  | { kind: "no-face" }
  | {
      kind: "face";
      face: Face;
      liveness?: Liveness;
      /** The inference adapter is responsible for applying its match threshold. */
      identity?: Identity;
      expression?: { label: string; confidence?: Score };
    }
) & { origin: "simulated" | "model" };

export type Sample = {
  id: string;
  label: string;
  image: { file: string; alt: string; width: number; height: number };
  result: AnalysisResult;
};

const probability = (value: number): Score => ({ value, unit: "probability" });
const cosine = (value: number): Score => ({ value, unit: "cosine" });

export const samples = [
  {
    id: "live-match",
    label: "Live + match",
    image: {
      file: "live-match.webp",
      alt: "Synthetic portrait of a woman facing the camera.",
      width: 768,
      height: 512,
    },
    result: {
      origin: "simulated",
      kind: "face",
      face: {
        bounds: { x: 0.33, y: 0.13, width: 0.34, height: 0.67 },
        landmarks: [
          { x: 0.443, y: 0.387 }, { x: 0.568, y: 0.387 }, { x: 0.506, y: 0.510 },
          { x: 0.457, y: 0.586 }, { x: 0.554, y: 0.586 },
        ],
      },
      liveness: { status: "live", confidence: probability(0.98) },
      identity: { status: "matched", name: "Maya Chen", similarity: cosine(0.92) },
      expression: { label: "Happy", confidence: probability(0.88) },
    },
  },
  {
    id: "live-unknown",
    label: "Live + unknown",
    image: {
      file: "live-unknown.webp",
      alt: "Synthetic portrait of a man facing the camera.",
      width: 400,
      height: 512,
    },
    result: {
      origin: "simulated",
      kind: "face",
      face: { bounds: { x: 0.17, y: 0.10, width: 0.68, height: 0.64 } },
      liveness: { status: "live", confidence: probability(0.94) },
      identity: { status: "unknown", similarity: cosine(0.43) },
      expression: { label: "Neutral", confidence: probability(0.91) },
    },
  },
  {
    id: "spoof",
    label: "Spoof",
    image: {
      file: "spoof.webp",
      alt: "A phone held up to the camera, showing a synthetic face on its screen.",
      width: 768,
      height: 512,
    },
    result: {
      origin: "simulated",
      kind: "face",
      face: { bounds: { x: 0.40, y: 0.22, width: 0.203, height: 0.40 } },
      liveness: { status: "spoof", confidence: probability(0.97) },
    },
  },
  {
    id: "no-face",
    label: "No face detected",
    image: {
      file: "no-face.webp",
      alt: "An empty studio with a chair in the camera frame.",
      width: 768,
      height: 512,
    },
    result: { origin: "simulated", kind: "no-face" },
  },
] as const satisfies readonly [Sample, ...Sample[]];

export function sampleUrl(sample: Sample) {
  return import.meta.env.BASE_URL + "samples/" + sample.image.file;
}

export function analyzeSample(sample: Sample, signal: AbortSignal): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => {
      window.clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve(sample.result);
    }, 550);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export function identityLabel(result: AnalysisResult) {
  if (result.kind === "no-face") return "Unavailable";
  if (result.liveness?.status !== "live") return "Identity withheld";
  return result.identity?.status === "matched" ? result.identity.name : "Unknown";
}

export function formatScore(score?: Score) {
  if (!score) return "Unavailable";
  return score.unit === "probability"
    ? new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(score.value)
    : score.value.toFixed(2);
}
