# core

Inference pipeline (one module per responsibility, easy to debug in isolation).

- schemas.py: dataclasses shared with the GUI (FrameResult, RegisterResult)
- config.py, logger.py: load configs/config.yaml, logging
- detector.py: face detection and alignment
- liveness.py: anti-spoofing (live / spoof)
- recognizer.py: embedding extraction and matching
- emotion.py: emotion classification
- registry.py: enrolled users, duplicate check (USER ALREADY EXISTS), add user
- pipeline.py: the only entry point used by Frontend-GUI
