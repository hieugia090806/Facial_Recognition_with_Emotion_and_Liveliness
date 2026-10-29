# Backend-Core

All model and business logic. No GUI code here.

| Folder | Purpose |
|---|---|
| configs/ | config.yaml: thresholds, paths, model names (single place to tune) |
| core/ | Inference pipeline: detector, liveness, recognizer, emotion, registry, schemas |
| training/ | Training and evaluation scripts per task |
| weights/ | Trained model weights (keep each file under 100 MB) |
| registry_data/ | Enrolled users and embeddings (no raw images) |
| scripts/ | CLI tools: demo_cli.py, download_data.py, extract_dataset.py |
| tests/ | Unit tests for core/ |

The dataset is NOT stored in the repository; it lives on Google Drive and is extracted into data/.
