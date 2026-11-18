import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Aperture, ArrowUpRight, Camera, Check, ChevronDown, CircleAlert, Fingerprint,
  Image, LoaderCircle, ScanFace, ShieldCheck, Smile, Upload,
} from "lucide-react";
import { analyzeSample, formatScore, identityLabel, samples } from "./analysis";
import type { AnalysisResult, Sample } from "./analysis";
import { UploadPreview, WebcamPreview } from "./MediaPreview";
import { SampleFrame } from "./SampleFrame";

type Run = { status: "ready" | "analyzing" | "error" } | { status: "results"; result: AnalysisResult };

const sources = [
  { id: "sample", label: "Sample", icon: Image },
  { id: "webcam", label: "Webcam", icon: Camera },
  { id: "upload", label: "Upload", icon: Upload },
] as const;

type Source = (typeof sources)[number]["id"];

const runLabels = {
  ready: "Ready", analyzing: "Analyzing", error: "Couldn’t analyze", results: "Results",
};

function Results({ run, source }: { run: Run; source: Source }) {
  const result = run.status === "results" ? run.result : undefined;
  const found = result?.kind === "face" ? result : undefined;
  const noFace = result?.kind === "no-face";
  const live = found?.liveness?.status === "live";
  const spoof = found?.liveness?.status === "spoof";
  const livenessText = noFace ? "No face detected" : live ? "Live" : spoof ? "Spoof detected" : found?.liveness ? "Inconclusive" : "Unavailable";
  const identity = result ? identityLabel(result) : "Unavailable";
  const status = source === "sample" ? runLabels[run.status] : "Preview mode";

  const message = result
    ? noFace ? "No face detected. Try a sample containing a face." : [livenessText, identity, found?.expression?.label].filter(Boolean).join(". ") + "."
    : run.status === "analyzing" ? "Analyzing sample."
      : run.status === "error" ? "Couldn’t analyze the sample. Run analysis again." : "";

  const rows = [
    {
      title: "Liveness", icon: ShieldCheck, value: result ? livenessText : "—",
      tone: live ? "positive" : spoof ? "negative" : found?.liveness || noFace ? "warning" : "neutral",
      detail: noFace ? "Try a sample containing a face." : found ? "Confidence " + formatScore(found.liveness?.confidence) : "Checks for a live face.",
    },
    {
      title: "Identity match", icon: Fingerprint, value: result ? identity : "—",
      tone: live && found?.identity?.status === "matched" ? "positive" : live ? "warning" : "neutral",
      detail: found && !live ? "Identity withheld by the liveness check."
        : live && found?.identity?.status !== "matched" ? "No identity met the match threshold."
        : found ? "Similarity " + formatScore(found.identity?.similarity) : noFace ? undefined : "Compares the face with enrolled identities.",
      score: live && found?.identity?.status !== "matched" && found?.identity?.similarity
        ? "Similarity " + formatScore(found.identity.similarity) : undefined,
    },
    {
      title: "Facial expression", icon: Smile, value: result ? found?.expression?.label ?? "Unavailable" : "—",
      tone: "neutral",
      detail: found?.expression ? "Confidence " + formatScore(found.expression.confidence)
        : result ? undefined : "Predicts an expression from visible facial cues.",
    },
  ];

  return (
    <section className="results" aria-labelledby="results-heading" id="result-panel" tabIndex={-1}>
      <div className="results-head">
        <div className="results-title">
          <h3 id="results-heading">Analysis output</h3>
          <span className={"run-status run-status--" + run.status} data-status={run.status}>
            {run.status === "analyzing" ? <LoaderCircle className="spinner" size={13} aria-hidden="true" /> : <i aria-hidden="true" />}
            {status}
          </span>
        </div>
        {run.status === "error"
          ? <p className="results-context result-error">Please run the sample again.</p>
          : source === "sample" && <p className="results-context">{result?.origin === "model" ? "Model results" : "Simulated results"}</p>}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">{message}</p>
      <dl className="result-rows" aria-busy={run.status === "analyzing"}>
        {rows.map(({ title, icon: Icon, value, tone, detail, score }) => {
          const StatusIcon = tone === "positive" ? Check : CircleAlert;
          return (
            <div className="result-row" key={title}>
              <dt><Icon size={17} aria-hidden="true" /> {title}</dt>
              <dd>
                <strong className={"result-value result-value--" + tone}>
                  {tone !== "neutral" && <StatusIcon size={17} aria-hidden="true" />}{value}
                </strong>
                {detail && <span className={detail.startsWith("Confidence") || detail.startsWith("Similarity") ? "score" : undefined}>{detail}</span>}
                {score && <span className="score">{score}</span>}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="expression-note">Expression is a prediction from visible facial features.</p>
    </section>
  );
}

export function Demo() {
  const [source, setSource] = useState<Source>("sample");
  const [sample, setSample] = useState<Sample>(samples[0]);
  const [run, setRun] = useState<Run>({ status: "ready" });
  const controller = useRef<AbortController | null>(null);
  const tabRefs = useRef<Partial<Record<Source, HTMLButtonElement | null>>>({});
  useEffect(() => () => controller.current?.abort(), []);

  function resetRun() {
    controller.current?.abort();
    controller.current = null;
    setRun({ status: "ready" });
  }

  function switchSource(next: Source) {
    if (next === source) return;
    resetRun();
    setSource(next);
  }

  function showSample() {
    switchSource("sample");
    tabRefs.current.sample?.focus();
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = sources.length - 1;
    const positions: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const nextIndex = positions[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    const next = sources[nextIndex];
    if (!next) return;
    switchSource(next.id);
    tabRefs.current[next.id]?.focus();
  }

  async function runSample() {
    if (run.status === "analyzing") return;
    controller.current?.abort();
    const pending = new AbortController();
    controller.current = pending;
    setRun({ status: "analyzing" });

    try {
      const result = await analyzeSample(sample, pending.signal);
      if (controller.current === pending) setRun({ status: "results", result });
    } catch {
      if (controller.current === pending) setRun({ status: "error" });
    }
  }

  return (
    <section className="demo shell" id="demo" tabIndex={-1} aria-labelledby="demo-heading">
      <div className="section-intro">
        <h2 id="demo-heading">Interactive demo</h2>
        <p>Run a sample to see how each check contributes to the result.</p>
      </div>

      <div className="demo-console" data-ui>
        <div className="source-bar">
          <div className="source-tabs" role="tablist" aria-label="Input source">
            {sources.map(({ id, label, icon: Icon }, index) => (
              <button
                type="button" key={id} id={"source-" + id} role="tab"
                aria-controls={"panel-" + id} aria-selected={source === id} tabIndex={source === id ? 0 : -1}
                ref={(node) => { tabRefs.current[id] = node; }}
                onClick={() => switchSource(id)} onKeyDown={(event) => onTabKey(event, index)}
              >
                <Icon size={17} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-body">
          <div className="input-column">
            {sources.map(({ id }) => (
              <div className="input-panel" key={id} id={"panel-" + id} role="tabpanel" aria-labelledby={"source-" + id} hidden={source !== id}>
                {source === id && (id === "sample" ? (
                  <>
                    <SampleFrame key={sample.id} sample={sample} result={run.status === "results" ? run.result : undefined} />
                    <div className="preview-controls sample-controls">
                      <div className="sample-field">
                        <label htmlFor="scenario">Sample scenario</label>
                        <div className="select-wrap">
                          <select id="scenario" value={sample.id} onChange={(event) => {
                            const selected = samples.find(({ id: sampleId }) => sampleId === event.target.value);
                            if (selected) {
                              resetRun();
                              setSample(selected);
                            }
                          }}>
                            {samples.map(({ id: sampleId, label }) => <option key={sampleId} value={sampleId}>{label}</option>)}
                          </select>
                          <ChevronDown size={16} aria-hidden="true" />
                        </div>
                      </div>
                      <button className="button button--primary run-button" type="button" onClick={runSample} aria-disabled={run.status === "analyzing"}>
                        {run.status === "analyzing" ? <LoaderCircle className="spinner" size={17} aria-hidden="true" /> : <ScanFace size={17} aria-hidden="true" />}
                        {run.status === "analyzing" ? "Analyzing…" : "Run analysis"}
                      </button>
                    </div>
                  </>
                ) : id === "webcam" ? <WebcamPreview onSample={showSample} /> : <UploadPreview onSample={showSample} />)}
              </div>
            ))}
            {source === "sample" && (
              <p className="sample-note">
                <Aperture size={15} aria-hidden="true" /> Sample imagery is synthetic.
                {run.status === "results" && <a className="jump-results" href="#result-panel">View results <ArrowUpRight size={13} aria-hidden="true" /></a>}
              </p>
            )}
          </div>
          <Results run={run} source={source} />
        </div>
      </div>
    </section>
  );
}
