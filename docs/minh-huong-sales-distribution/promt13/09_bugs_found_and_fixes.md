# Bugs Found And Fixes

## No Existing Safe History Read Path

Inventory showed there was no activation order detail endpoint and no status history endpoint. The fix was a dedicated minimal endpoint instead of expanding list payloads.

## Scope Duplication Risk

`listOrders` previously had inline scope logic. Prompt 13 extracted that logic into `orderVisibilityWhere` and reused it for history reads. This reduces risk that history visibility drifts from order list visibility.

## Metadata Exposure Risk

Prompt 12 history metadata can include file storage keys. Prompt 13 adds conservative read-time sanitization so history metadata does not expose raw storage paths, URLs, base64/blob fields, or raw file content.

## No Write Bug Fixed

No Prompt 12 write-path bug was found or changed.

