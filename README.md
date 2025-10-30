# SailEco Widgets

Lightweight React + Vite site that showcases four SailWise-style speed widgets for the same Megastar route. Each variant experiments with a different UI treatment (mood colours, reward marker, CO₂ spotlight, minimal pills). Slider choices are captured and, on submission, forwarded to Netlify Forms.

## Local development

```powershell
npm install
npm run dev
```

## Building for Netlify

```powershell
npm run build
```

Netlify will pick up the generated form named `widget-values` and store every submission. The hidden JSON field (`widgetSummaryJson`) captures all widget selections in one payload for later analysis.
