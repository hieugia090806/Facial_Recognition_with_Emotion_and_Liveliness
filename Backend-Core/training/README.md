# training

One script per task so teammates can work in parallel without conflicts.

- data/: dataset loaders and transforms (feature/data-pipeline)
- train_classification.py: softmax classifier on classification_data (feature/face-recognition)
- train_metric.py: triplet / metric-learning model for verification (feature/face-recognition)
- train_liveness.py: anti-spoofing (feature/anti-spoofing)
- train_emotion.py: emotion recognition (feature/emotion-detection)
- evaluate.py: ROC, AUC, EER, accuracy, confusion matrix
