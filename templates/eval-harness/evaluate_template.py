"""
Standard Evaluation Harness Template for 10-Week AI Builder Challenge.
Provides standardized field-level accuracy, precision, recall, and markdown report generation.
"""

import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional


@dataclass
class FieldMetric:
    total: int = 0
    correct: int = 0
    fuzzy_match: int = 0
    missing: int = 0
    hallucinated: int = 0

    @property
    def exact_accuracy(self) -> float:
        return (self.correct / self.total * 100) if self.total > 0 else 0.0

    @property
    def relaxed_accuracy(self) -> float:
        return ((self.correct + self.fuzzy_match) / self.total * 100) if self.total > 0 else 0.0


class BaseEvaluator:
    def __init__(self, dataset_path: Path, output_report_path: Path):
        self.dataset_path = dataset_path
        self.output_report_path = output_report_path
        self.metrics: Dict[str, FieldMetric] = {}
        self.results_log: List[Dict[str, Any]] = []

    def load_dataset(self) -> List[Dict[str, Any]]:
        with open(self.dataset_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def evaluate(self, inference_fn: Callable[[Dict[str, Any]], Dict[str, Any]]) -> Dict[str, Any]:
        dataset = self.load_dataset()
        start_time = time.time()

        for item in dataset:
            predicted = inference_fn(item)
            self.compare_sample(item, predicted)

        elapsed = time.time() - start_time
        summary = {
            "total_samples": len(dataset),
            "elapsed_seconds": round(elapsed, 2),
            "field_metrics": {k: vars(v) for k, v in self.metrics.items()},
        }
        self.generate_markdown_report(summary)
        return summary

    def compare_sample(self, ground_truth: Dict[str, Any], predicted: Dict[str, Any]):
        raise NotImplementedError("Implement custom field-level comparison in subclass.")

    def generate_markdown_report(self, summary: Dict[str, Any]):
        raise NotImplementedError("Implement custom markdown report generator in subclass.")
