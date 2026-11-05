# Backend-Core

All model and business logic of the system. No interface code lives here: the interface in `Frontend-GUI` only calls the pipeline in `core/`.

## What this part does

For every input photo, the backend:

1. detects and aligns the face,
2. checks that the face is live (anti-spoofing),
3. identifies the person (face verification) and reads the emotion,
4. if the person is unknown, can enroll them as a new member.

Python code runs in Google Colab. Data, trained weights and lookup tables live on Google Drive; code and settings live in this repository.

## Folder structure

| Folder | Purpose |
|---|---|
| `configs/` | `config.yaml`: thresholds, paths, number of enrollment frames. The single place to tune the system. |
| `core/` | Inference pipeline, one module per job: `detector`, `liveness`, `recognizer`, `emotion`, `registry`, `schemas`, `config`, `logger`, and `pipeline` (the only entry point used by the interface). |
| `training/` | Notebooks and scripts for EDA, pre-processing, training and evaluation, one per task (for example `Face_Recognition.ipynb`, `Anti_Spoofing.ipynb`). |
| `weights/` | Small trained weights. Each file must stay under 100 MB; larger files go to Google Drive. |
| `registry_data/` | Local index of enrolled users and embeddings. No raw photos. |
| `scripts/` | Helper tools, such as `extract_dataset.py` and `demo_cli.py`. |
| `tests/` | Unit tests for `core/`. |

Some folders are empty for now and appear once the first file is added.

## Pipeline order

`pipeline.verify(image)` runs the modules in a fixed order:

1. `detector`: find one face, align and crop it (for example 112x112).
2. `liveness`: a spoof stops the run with the result SPOOF.
3. `recognizer`: make an embedding and compare it with the identities table (cosine similarity).
4. `emotion`: predict the emotion of the same live face.

Results: VERIFIED (ID, name, status, score), NOT FOUND, SPOOF, USER ALREADY EXISTS (during enrollment).

## Lookup tables (on Google Drive)

- `identities.csv`: ID, Name, Image, Status (`old member` or `new member`), embedding file.
- `emotions.csv`: ID, label, description.

## Data

The dataset is not stored in this repository. It lives on Google Drive in three folders: Face Recognition, Emotion Detection and Anti-Spoofing. In Colab, mount Drive, copy the folder you need to `/content/data` and extract it there; this is much faster than reading files from Drive one by one.

## Working rules

- Work on the `develop` branch and open pull requests; never push directly to `main`.
- One person per notebook or script to avoid merge conflicts.
- Clear all notebook outputs before committing (Colab: Edit, Clear all outputs).
- Never commit datasets, zip files, personal photos or embeddings.
- Put reusable code in `.py` files and import it from notebooks.
- Change thresholds only in `configs/config.yaml`, and tell the team.
