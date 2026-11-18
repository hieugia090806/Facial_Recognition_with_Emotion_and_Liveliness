# Face Recognition Lab

A browser demo for COS30082 Applied Machine Learning at Swinburne University of Technology.

## Run locally

Use Node.js 22.12 or a newer supported Node release. Run these commands from the repository root.

```sh
cd frontend_gui/web
npm ci
npm run dev
```

Open the Local URL printed by Vite. Select **Try the demo**, then **Run analysis**. **Sample** opens on **Live + match** so the first run needs no setup or browser permissions.

```sh
npm run typecheck
npm run build
npm run preview
```

The production build is written to `frontend_gui/web/dist/`. The webcam needs a browser with camera support on HTTPS or localhost.

## Demo modes

| Mode | Behavior |
| --- | --- |
| Sample | Four fixed, explicitly marked simulated results. Live + match displays a fictional identity. Live + unknown displays Unknown. Spoof withholds identity. No face detected has no bounding box. |
| Webcam | Local preview after the user starts the camera. Tracks are stopped when the user stops it, changes sources, or leaves the page. |
| Upload | Local preview for JPG, PNG, WebP, MP4, or WebM, subject to the browser’s decoder. Replacing or removing a file releases its object URL. |

Webcam and Upload are preview modes until a model is connected. The app sends no camera frames, file contents, or facial data to a server. All four sample assets in `public/samples/` are local WebP crops from an original ImageGen contact sheet of fictional studio subjects, a phone displaying a synthetic portrait, and an empty studio.

<details>
<summary>ImageGen prompt</summary>

> Photorealistic editorial studio contact sheet for a computer vision classroom demo. Exactly four equal quadrants forming a precise 2 by 2 grid, no outer margins no gutters no divider lines, each quadrant has identical width and height with boundaries strictly at center. Wide 3:2 overall image. Each quadrant is its own independently framed landscape photo. Unified desaturated colors, deep cool graphite backgrounds with faint teal side light and soft grain. Top left: head-on synthetic fictional young adult female lab subject of East Asian appearance, short dark bob, warm brown eyes, faint closed-mouth smile, plain black crewneck, exactly centered in her own quadrant, crown at 12% of that quadrant and shoulders at its bottom, face evenly visible, lifelike editorial photography. Top right: a distinct synthetic fictional young adult man with dark curly hair and olive skin and neutral expression, centered head and shoulders under similar lighting. Bottom left: a straight-on handheld modern black smartphone with a clearly visible bezel, screen visibly showing a still synthetic headshot of the same dark-bob woman; hand only at the bottom, device occupies central half of frame and is completely contained in its quadrant. Bottom right: an unoccupied camera frame, charcoal photo studio with an empty chair off center and cool dim side light, absolutely no humans, portraits or faces. Focus on clear photographic silhouettes and legible faces. No writing, numbers, graphics, UI overlays, meshes or watermarks. These will be sliced at the exact quadrant boundaries for four separate assets.

</details>

## Implementation

- `src/App.tsx` and `src/styles.css` define the English landing page, pipeline diagram, and responsive presentation.
- `src/Demo.tsx` manages source tabs, analysis states, cancellation, and result ordering.
- `src/analysis.ts` defines the fixtures, output type, score units, and the identity display gate.
- `src/SampleFrame.tsx` places normalized bounding boxes and landmarks inside the displayed image area.
- `src/MediaPreview.tsx` owns webcam streams and local preview URLs.

The demo was built from `develop` (`4be624c`). That checkout has EDA notebooks and an interface proposal. The [backend README](../../backend_core/README.md) and [technical draft](../../documents/COS30082_2026-11-05_TechDoc_Technical-Description_Draft.pdf) describe liveness as a gate before recognition and expression. The diagram shows this intended order. The checkout has no runnable `core/pipeline.py`, inference API, weights, or verified model benchmarks.

When inference becomes available, adapt the verified endpoint response to `AnalysisResult`. Apply the backend’s match threshold when assigning `identity.status`, preserve the backend’s score scale, and map box coordinates into the original media’s normalized coordinate space. The UI displays an identity only when liveness is `live` and identity is `matched`.
