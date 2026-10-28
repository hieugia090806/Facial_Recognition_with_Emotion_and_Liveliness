# Facial Recognition with Emotion and Liveliness

A computer vision pipeline that identifies a person from a face image or video stream, recognises their facial emotion, and verifies that the face belongs to a live person rather than a spoofing attempt (printed photo, screen replay or mask).

> **Unit:** Applied Machine Learning (COS30082), Swinburne University of Technology
> **Author:** Truong Ngoc Gia Hieu, Le Xuan Ny, Pham Nguyen Minh Hoang, Nguyen Quang Khai, Pahan Parithna, Pham Dinh Duc Anh

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Dataset](#dataset)
7. [Usage](#usage)
8. [Models and Methodology](#models-and-methodology)
9. [Results](#results)
10. [Limitations and Ethical Considerations](#limitations-and-ethical-considerations)
11. [Future Work](#future-work)
12. [Use of Generative AI](#use-of-generative-ai)
13. [References](#references)
14. [License](#license)
15. [Contact](#contact)

---

## Overview

Face recognition systems are widely used for authentication and access control, but a recogniser alone can be fooled by a photo or video of the target person. This project combines three tasks in one pipeline:

| Task | Question answered | Output |
|------|-------------------|--------|
| **Face recognition** | Who is this person? | Identity label and similarity score |
| **Emotion recognition** | How does this person appear to feel? | One of the emotion classes (e.g. happy, sad, angry, neutral) |
| **Liveness detection** | Is this a real, live face? | `live` or `spoof` with a confidence score |

The identity result is accepted only when the liveness check passes, which makes the system more robust against presentation attacks.

## Features

- Face detection and alignment from images, video files and webcam streams
- Identity recognition using face embeddings and similarity matching
- Facial emotion classification
- Liveness (anti-spoofing) detection
- Evaluation scripts with standard metrics (accuracy, precision, recall, F1, confusion matrix, ROC/EER)
- Reproducible training and inference through configuration files

## System Architecture

```
Input (image / video / webcam)
        |
        v
 Face Detection and Alignment
        |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
 Liveness Detection   Face Recognition   Emotion Recognition
  (live / spoof)     (embedding + match)   (emotion class)
        |                    |                    |
        +--------------------+--------------------+
                             |
                             v
          Decision Logic: accept identity only if live
                             |
                             v
             Output: identity, emotion, liveness
```

## Project Structure

```
Facial_Recognition_with_Emotion_and_Liveliness/
├── data/                  # Datasets (not tracked by Git, see Dataset)
├── models/                # Trained weights (not tracked by Git)
├── notebooks/             # Exploration, training and evaluation notebooks
├── src/
│   ├── detection/         # Face detection and alignment
│   ├── recognition/       # Face embedding and matching
│   ├── emotion/           # Emotion classification
│   ├── liveness/          # Anti-spoofing
│   └── utils/             # Shared helpers
├── configs/               # Experiment and inference configuration
├── scripts/               # download_data.py, train.py, evaluate.py, demo.py
├── results/               # Figures, metrics and logs
├── requirements.txt
├── .gitignore
└── README.md
```

> The layout above is the intended structure. Adjust it to match the final contents of the repository.

## Getting Started

### Prerequisites

- Python 3.10 or later
- A webcam (optional, for the real-time demo)
- A CUDA-capable GPU (optional, recommended for training)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hieugia090806/Facial_Recognition_with_Emotion_and_Liveliness.git
cd Facial_Recognition_with_Emotion_and_Liveliness

# 2. Create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

## Dataset

The dataset is approximately **1.1 GB**, which exceeds the free limits of Git LFS, so it is hosted on Google Drive and is **not** stored in this repository.

1. Download the dataset: **[Google Drive link](PASTE_YOUR_DRIVE_LINK_HERE)**
2. Extract it into the `data/` folder, or download it from the command line:

```bash
pip install gdown
gdown --fuzzy "PASTE_YOUR_DRIVE_LINK_HERE" -O data/dataset.zip
unzip data/dataset.zip -d data/
```

Expected layout after extraction:

```
data/
├── recognition/   # Face images grouped by identity
├── emotion/       # Face images grouped by emotion label
└── liveness/      # Live and spoof samples
```

| Subset | Purpose | Classes |
|--------|---------|---------|
| Recognition | Identity training and matching | Identities |
| Emotion | Emotion classification | Emotion labels |
| Liveness | Anti-spoofing | `live`, `spoof` |

> Dataset sources, licences and sample counts should be listed here once finalised. Faces are personal data: do not publish the dataset publicly unless you have the right to do so.

## Usage

### Train

```bash
python scripts/train.py --config configs/emotion.yaml
python scripts/train.py --config configs/liveness.yaml
```

### Evaluate

```bash
python scripts/evaluate.py --task recognition --weights models/recognition.pt
python scripts/evaluate.py --task emotion --weights models/emotion.pt
python scripts/evaluate.py --task liveness --weights models/liveness.pt
```

### Run the demo

```bash
# Webcam
python scripts/demo.py --source 0

# Image or video file
python scripts/demo.py --source path/to/file.mp4
```

The demo draws a bounding box on each face with the identity, emotion and liveness result.

## Models and Methodology

| Component | Approach | Notes |
|-----------|----------|-------|
| Face detection | Pre-trained detector (e.g. MTCNN, RetinaFace or MediaPipe) | Provides boxes and landmarks for alignment |
| Face recognition | CNN embedding with cosine similarity matching | Threshold selected on a validation set |
| Emotion recognition | CNN with transfer learning from a pre-trained backbone | Fine-tuned on the emotion subset |
| Liveness detection | Binary CNN classifier on live versus spoof samples | Trained with augmentation to improve generalisation |

**Training setup:** data split into training, validation and test sets with no identity overlap between splits; augmentation (flip, rotation, brightness); Adam optimiser with a learning-rate schedule. Fill in the final hyperparameters below.

| Hyperparameter | Value |
|----------------|-------|
| Backbone | _TBD_ |
| Input size | _TBD_ |
| Batch size | _TBD_ |
| Learning rate | _TBD_ |
| Epochs | _TBD_ |

## Results

Replace the placeholders with measured results from the test set.

| Task | Metric | Result |
|------|--------|--------|
| Recognition | Accuracy / Verification AUC | _TBD_ |
| Emotion | Accuracy / Macro F1 | _TBD_ |
| Liveness | Accuracy / EER / APCER / BPCER | _TBD_ |

Figures such as confusion matrices, ROC curves and demo screenshots are stored in `results/`.

## Limitations and Ethical Considerations

- **Bias:** accuracy can vary across age, gender, skin tone, lighting and camera quality, depending on the training data.
- **Emotion recognition:** the model estimates visible facial expressions, not a person's true internal feelings.
- **Spoofing:** liveness detection reduces but does not eliminate presentation attacks, and may perform worse on attack types it was not trained on.
- **Privacy:** facial images are sensitive personal data. Obtain consent, store data securely and follow applicable privacy rules.
- **Intended use:** academic and educational use only, not for surveillance or high-stakes decisions.

## Future Work

- Test against more spoofing attacks (3D masks, high-quality replay)
- Add depth or infrared cues for stronger liveness detection
- Optimise the models for real-time inference on edge devices
- Evaluate fairness across demographic groups

## Use of Generative AI

Generative AI tools were used in this project in accordance with the unit's policy. Tools used and their purposes: _list the tools and what they were used for, for example: Claude, used to help draft documentation and debug code._

## References

1. Add the papers, datasets and libraries used, in Harvard (Swinburne) style.

## License

Specify a licence (for example MIT) or state that the project is for academic use only.

## Contact

**Truong Ngoc Gia Hieu**, Swinburne University of Technology
Email: 105565520@student.swin.edu.au
GitHub: [hieugia090806](https://github.com/hieugia090806)
