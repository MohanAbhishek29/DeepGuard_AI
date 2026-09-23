import logging

import pandas as pd
import torch
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from tqdm import tqdm

logger = logging.getLogger(__name__)


def evaluate_model(model, dataloader, device, output_csv="evaluation_results.csv"):
    """
    Comprehensive evaluation of the trained model.
    Calculates detailed metrics and saves predictions to a CSV file.
    """
    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []
    all_probs = []

    logger.info(f"Starting evaluation on {len(dataloader.dataset)} samples...")

    with torch.no_grad():
        for inputs, labels in tqdm(dataloader, desc="Evaluating"):
            inputs = inputs.to(device)
            outputs = model(inputs)

            # Apply softmax to get probabilities
            probs = torch.softmax(outputs, dim=1)[:, 1]  # Prob of class 1 (Fake)
            preds = torch.argmax(outputs, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    # Calculate Metrics
    acc = accuracy_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds)
    auc = roc_auc_score(all_labels, all_probs)
    cm = confusion_matrix(all_labels, all_preds)

    logger.info("Evaluation Complete!")
    logger.info(f"Accuracy: {acc:.4f}")
    logger.info(f"F1 Score: {f1:.4f}")
    logger.info(f"ROC AUC:  {auc:.4f}")
    logger.info(f"Confusion Matrix:\n{cm}")

    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=["Real", "Fake"]))

    # Save results to CSV for analysis
    try:
        results_df = pd.DataFrame(
            {
                "True_Label": all_labels,
                "Predicted_Label": all_preds,
                "Fake_Probability": all_probs,
            }
        )
        results_df.to_csv(output_csv, index=False)
        logger.info(f"Detailed predictions saved to {output_csv}")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Failed to save evaluation CSV: {e}")

    return {"accuracy": acc, "f1": f1, "auc": auc, "confusion_matrix": cm.tolist()}
