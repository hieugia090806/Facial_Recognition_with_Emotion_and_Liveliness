# Frontend-GUI

The user interface of the system: capture a photo, show the result, and register new members. It contains no model logic; it only calls the public functions of `Backend-Core/core/pipeline.py`.

## What this part does

- Takes a photo from the webcam (or an uploaded image) and sends it to the backend.
- Shows the result: VERIFIED (ID, name, status), NOT FOUND, SPOOF, and the emotion.
- When a person is NOT FOUND, asks for their name and runs the registration flow. If the person is already enrolled, shows USER ALREADY EXISTS.

The interface runs in Google Colab. Colab cannot open a laptop camera directly, so a short JavaScript snippet captures a photo in the notebook, or the user uploads an image. Whether live video is required is still an open question for the team.

## Folder structure

| Folder | Purpose |
|---|---|
| `ui/` | Notebook or app code: Verify and Register buttons, result display, boxes and labels drawn on the image. |
| `camera/` | Photo capture (webcam snippet) or file upload. Returns an image to the backend. |
| `assets/` | Small icons, fonts and styles, for example one icon per emotion. |

Some folders are empty for now and appear once the first file is added.

## How it talks to the backend

Only two calls are allowed:

- `verify(image)`: returns the result, ID, name, status, emotion and score.
- `enroll(name, images)`: registers a new member, or returns USER ALREADY EXISTS.

Do not import detector, liveness, recognizer or emotion modules directly.

## Working rules

- Work on the `develop` branch and open pull requests; never push directly to `main`.
- No model code or training code here; it belongs in `Backend-Core`.
- Keep assets small, and clear notebook outputs before committing.
- Do not commit photos of real people.
