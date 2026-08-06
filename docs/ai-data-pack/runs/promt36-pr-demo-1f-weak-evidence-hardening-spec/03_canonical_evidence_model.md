# Canonical Read-Only Evidence Model

This model describes reusable read-only evidence rows for future Director JSON output. It is not Action Draft Schema. It does not describe executable actions, provider payloads, approvals, imports, mutations, or dry-run/live execution.

## Evidence Row Fields

| Field | Purpose |
| --- | --- |
| `finding_key` | Stable machine key for the finding. |
| `finding_label` | Human-readable label for director review. |
| `evidence_strength` | `strong`, `medium`, `weak`, or `insufficient`. |
| `source_domain` | ERP domain such as procurement, finance, inventory, labor, or supplier performance. |
| `source_collections_or_modules` | Read-only source collections/modules used to produce the evidence. |
| `time_window` | Period covered by the evidence, for example `last_30_days`. |
| `affected_entity_type` | Entity type such as supplier, dealer, SKU, staff group, or product. |
| `affected_entity_id` | Stable internal id where available. |
| `affected_entity_name_or_alias` | Safe display name or alias. |
| `metric_name` | Name of the measured metric. |
| `metric_value` | Numeric or categorical value. |
| `threshold_value` | Threshold or benchmark used to classify risk. |
| `comparison_period` | Prior period or peer group used for comparison. |
| `calculation_method` | Plain-language method used to compute the metric. |
| `sample_size` | Count of rows/entities supporting the metric. |
| `data_quality_status` | `pass`, `caution`, `fail`, or `not_available`. |
| `confidence` | `high`, `medium`, `low`, or `blocked`. |
| `blocking_reason_if_any` | Reason the conclusion must be downgraded or blocked. |
| `recommended_advisory_language` | Safe advisory wording for ChatGPT Web/director summary. |
| `not_allowed_actions` | Explicit list of actions ChatGPT Web must not infer. |

## Minimal JSON Shape

```json
{
  "finding_key": "supplier_cost_up",
  "finding_label": "Supplier cost increased without matching dealer price update",
  "evidence_strength": "medium",
  "source_domain": "procurement_pricing",
  "source_collections_or_modules": ["supplier_quote_history", "product_cost_history", "dealer_price_history"],
  "time_window": "last_90_days",
  "affected_entity_type": "product_supplier_pair",
  "affected_entity_id": "example_redacted_id",
  "affected_entity_name_or_alias": "redacted product / supplier alias",
  "metric_name": "cost_increase_percent",
  "metric_value": 15.0,
  "threshold_value": 10.0,
  "comparison_period": "previous_effective_cost",
  "calculation_method": "latest approved supplier cost compared with previous approved supplier cost",
  "sample_size": 1,
  "data_quality_status": "caution",
  "confidence": "medium",
  "blocking_reason_if_any": null,
  "recommended_advisory_language": "Review pricing lag before deciding whether to adjust dealer price.",
  "not_allowed_actions": ["do_not_change_price", "do_not_notify_provider", "do_not_create_action_draft"]
}
```

## Boundary

The model is evidence-only. It can support future Director JSON review, but it must not be used as an action contract or provider execution schema.

