---
name: generate-app-store-update-info
description: Generate update.txt in the project root from the updateInfo object in components/Modals/StartupModals/UpdateInfo.tsx. Use when the user asks to generate, regenerate, or update the App Store update.txt release-notes file.
---

# Generate update.txt

Read the `updateInfo` object in [components/Modals/StartupModals/UpdateInfo.tsx](components/Modals/StartupModals/UpdateInfo.tsx) and write `update.txt` in the project root.

## Output format

```
Features:
- <feature title 1>
- <feature title 2>
...

Bugfixes:
- <bugfix description 1>
- <bugfix description 2>
...
```

## Rules

- **Features**: use only the `title` field (ignore `description`). Lowercase every word *except* the first letter of the title (e.g. `"Media Viewer Rewrite"` → `"Media viewer rewrite"`). Preserve proper nouns and brand names that appear in the original casing only when they are clearly proper nouns (e.g. `Hydra`, `Reddit`, `Android`, `Wikipedia`); when in doubt, follow strict sentence-case.
- **Bugfixes**: use the `description` field verbatim — do not change casing or punctuation.
- Preserve the order from the source file.
- Include both sections even if one is empty (write the heading with no list items).
- Do not include `proFeatures` in the output.
- Overwrite `update.txt` if it already exists.
