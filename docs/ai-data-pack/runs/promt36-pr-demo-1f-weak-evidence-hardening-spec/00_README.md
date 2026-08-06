# Prompt 36 README

Phase: PR-DEMO-1F-A  
Title: Weak-Evidence ERP Data Hardening Spec  
Mode: BA/data spec only

This run creates a read-only ERP data hardening specification for the five weak-evidence Director JSON findings:

- `supplier_cost_up`
- `overdue_dealer_receivables`
- `low_inventory_best_seller`
- `labor_overtime_high`
- `slow_supplier_good_cost`

This is non-action work. It does not create Action Draft Schema, does not call OpenAI APIs, does not add provider execution, does not access production DB, does not add migrations, and does not change application code.

The goal is to define what ERP data should be surfaced into future Director JSON exports so these findings can move from alert-label-only evidence to evidence-backed advisory analysis.

## Source Limitation

The requested Prompt 35 folderized packet path was not present in this repo:

```text
docs/ai-data-pack/runs/promt35-pr-demo-1e-acceptance-packet/
```

Prompt 36 therefore uses the attached Prompt 36/control-pack files and the available local transcript evidence in `C:\Users\PC\Downloads\chatgptweb_director_demo_analysis_transcript.md`. Evidence mirror files in this run record that limitation instead of inventing missing Prompt 35 contents.

