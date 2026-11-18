import { ArrowDown, ArrowDownRight, ArrowUpRight, ScanFace, ShieldCheck } from "lucide-react";
import { samples } from "./analysis";
import { Demo } from "./Demo";
import { SampleFrame } from "./SampleFrame";

const repo = "https://github.com/hieugia090806/Facial_Recognition_with_Emotion_and_Liveliness";

function Brand() {
  return (
    <>
      <ScanFace size={24} strokeWidth={1.65} aria-hidden="true" />
      <span>Face Recognition Lab</span>
    </>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="shell nav-row">
        <a href="#top" className="wordmark"><Brand /></a>
        <nav aria-label="Main navigation">
          <a className="nav-link" href="#how-it-works">How it works</a>
          <a className="nav-link" href={repo}>GitHub <ArrowUpRight aria-hidden="true" size={14} /></a>
          <a className="button button--secondary nav-cta" href="#demo">Try the demo <ArrowDownRight aria-hidden="true" size={15} /></a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const sample = samples[0];
  return (
    <section className="hero shell" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <h1 id="hero-heading">Face recognition <span>with a liveness check</span></h1>
        <p className="hero-description">See how the pipeline checks whether a face is live, matches it to an enrolled identity, and predicts a facial expression.</p>
        <div className="hero-actions">
          <a className="button button--primary hero-cta" href="#demo">Try the demo <ArrowDown size={17} aria-hidden="true" /></a>
          <a className="button button--text" href="#how-it-works">See how it works <ArrowDownRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <figure className="hero-figure">
        <SampleFrame sample={sample} result={sample.result} illustrative />
        <figcaption><span><i aria-hidden="true" />Illustrative preview</span><span>Synthetic portrait</span></figcaption>
      </figure>
    </section>
  );
}

const inputSteps = [
  { title: "Image or video", detail: "Read a frame from a camera or media file." },
  { title: "Face detection", detail: "Find, align, and crop the face in the frame." },
];

const downstreamSteps = [
  { title: "Identity match", detail: "Compare the detected face with enrolled identities and apply a match threshold." },
  { title: "Facial expression", detail: "Classify the expression predicted from visible facial features." },
];

function Pipeline() {
  return (
    <section className="pipeline shell" id="how-it-works" tabIndex={-1} aria-labelledby="pipeline-heading">
      <div className="section-intro pipeline-intro">
        <h2 id="pipeline-heading">How it works</h2>
        <p>The planned pipeline checks liveness before accepting an identity.</p>
      </div>

      <ol className="pipeline-track" role="list">
        {inputSteps.map(({ title, detail }) => (
          <li className="pipeline-step" key={title}>
            <h3>{title}</h3><p>{detail}</p>
            <span className="pipeline-arrow" aria-hidden="true" />
          </li>
        ))}
        <li className="pipeline-step pipeline-gate">
          <h3><ShieldCheck size={17} aria-hidden="true" />Liveness</h3><p>Check for a live face. Continue only if the check passes.</p>
          <span className="pipeline-arrow" aria-hidden="true" />
        </li>
        {downstreamSteps.map(({ title, detail }, index) => (
          <li className="pipeline-step" key={title}>
            <h3>{title}</h3><p>{detail}</p>
            {index === 0 && <span className="pipeline-arrow" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="pipeline-output">
        <strong><ArrowDown size={17} aria-hidden="true" /> Analysis output</strong>
        <p>A live face gets a name when the match meets the threshold. If the liveness check fails, the pipeline withholds identity.</p>
      </div>
      <p className="academic-note">Built for academic demonstration. Lighting and camera quality can affect predictions. Facial expression is estimated from visible features.</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-row">
        <div>
          <p className="footer-name">Facial Recognition with Emotion and Liveliness</p>
          <p>COS30082 Applied Machine Learning · Swinburne University of Technology</p>
        </div>
        <a href={repo}>GitHub <ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div id="top" />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Demo />
        <Pipeline />
      </main>
      <Footer />
    </>
  );
}
