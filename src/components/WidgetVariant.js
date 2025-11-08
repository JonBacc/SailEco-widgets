import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import clsx from "clsx";
import { useMemo, useState } from "react";
export const REWARD_TOLERANCE = 0.02;
export function computeTravelMinutes(baselineMinutes, speedMultiplier) {
    const travelMinutes = baselineMinutes / speedMultiplier;
    return Math.round(travelMinutes);
}
export function computeMinutesDelta(baselineMinutes, speedMultiplier) {
    return computeTravelMinutes(baselineMinutes, speedMultiplier) - baselineMinutes;
}
export function computeReductionPct(speedMultiplier) {
    return (1 - speedMultiplier) * 100;
}
export function computeSpeedDeltaPct(speedMultiplier) {
    return (speedMultiplier - 1) * 100;
}
export function computeCo2DeltaKg(baselineCo2Kg, speedMultiplier) {
    const emissionRatio = Math.pow(speedMultiplier, 3);
    const delta = baselineCo2Kg * (1 - emissionRatio);
    return delta;
}
export function isRewardUnlocked(config, value) {
    const marker = config.pace.rewardMarkerMultiplier;
    if (typeof marker !== "number") {
        return false;
    }
    return value <= marker + REWARD_TOLERANCE;
}
function formatDuration(minutes) {
    const totalMinutes = Math.max(0, Math.round(Math.abs(minutes)));
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const parts = [];
    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }
    if (remainingMinutes > 0) {
        parts.push(`${remainingMinutes} min`);
    }
    if (parts.length === 0) {
        return "0 min";
    }
    return parts.join(" ");
}
function formatMinutesDelta(minutesDelta) {
    if (minutesDelta === 0) {
        return "Same arrival time";
    }
    const duration = formatDuration(Math.abs(minutesDelta));
    if (minutesDelta > 0) {
        return `Arrives +${duration} later`;
    }
    return `Arrives ${duration} earlier`;
}
function formatAddedMinutes(minutesDelta) {
    if (minutesDelta === 0) {
        return "No change";
    }
    const sign = minutesDelta > 0 ? "+" : "-";
    const duration = formatDuration(Math.abs(minutesDelta));
    return `${sign}${duration}`;
}
function formatCo2Delta(deltaKg) {
    const rounded = Math.abs(Math.round(deltaKg));
    if (deltaKg >= 0) {
        return `Saves ${rounded} kg CO₂`;
    }
    return `Adds ${rounded} kg CO₂`;
}
export default function WidgetVariant({ config, value, onValueChange, compact = false }) {
    const [infoOpen, setInfoOpen] = useState(false);
    const { baselineMinutes, baselineCo2Kg, minSpeedMultiplier, maxSpeedMultiplier, step = 0.02, } = config.pace;
    const reductionPct = useMemo(() => computeReductionPct(value), [value]);
    const minutesDelta = useMemo(() => computeMinutesDelta(baselineMinutes, value), [baselineMinutes, value]);
    const co2DeltaKg = useMemo(() => computeCo2DeltaKg(baselineCo2Kg, value), [baselineCo2Kg, value]);
    const normalized = (value - minSpeedMultiplier) / (maxSpeedMultiplier - minSpeedMultiplier);
    const clampedNormalized = Math.min(Math.max(normalized, 0), 1);
    const moodHue = 120 * (1 - clampedNormalized);
    const moodBackground = `linear-gradient(180deg, hsl(${moodHue}, 82%, 92%) 0%, #ffffff 100%)`;
    const moodAccent = `hsl(${moodHue}, 70%, 38%)`;
    const sliderFillPercent = Math.round(clampedNormalized * 100);
    const sliderBackground = `linear-gradient(90deg, rgba(15,157,88,0.65) 0%, rgba(15,157,88,0.65) ${sliderFillPercent}%, rgba(192,57,43,0.45) ${sliderFillPercent}%, rgba(192,57,43,0.45) 100%)`;
    const rewardUnlocked = isRewardUnlocked(config, value);
    const rewardMarkerPercent = typeof config.pace.rewardMarkerMultiplier === "number"
        ? ((config.pace.rewardMarkerMultiplier - minSpeedMultiplier) / (maxSpeedMultiplier - minSpeedMultiplier)) * 100
        : 0;
    const clampedRewardMarkerPercent = Math.min(Math.max(rewardMarkerPercent, 0), 100);
    const infoContentId = `${config.id}-info`;
    const isCompact = compact;
    const showContext = !isCompact;
    const showHints = !isCompact;
    const showFootnote = !isCompact && Boolean(config.footnote);
    return (_jsxs("article", { className: clsx("widget-card", `widget-card--${config.variant}`, isCompact && "widget-card--compact"), style: config.variant === "mood" ? { background: moodBackground } : undefined, children: [showContext && (_jsxs("header", { className: "widget-card__header", children: [_jsxs("div", { className: "widget-card__topline", children: [_jsx("span", { className: "widget-card__operator", children: "Tallink \u00B7 Megastar" }), config.badge && _jsx("span", { className: "widget-card__badge", children: config.badge })] }), _jsx("h2", { className: "widget-card__route", children: "Helsinki \u2192 Tallinn" }), _jsx("span", { className: "widget-card__meta", children: "Usual pace 2h 00m \u00B7 Tonight's sea state calm" })] })), _jsxs("div", { className: "widget-card__control", children: [_jsxs("div", { className: "widget-card__control-header", children: [_jsx("label", { className: "widget-card__slider-label", htmlFor: `${config.id}-slider`, children: "Vote on the trip speed" }), _jsx("button", { type: "button", className: "widget-card__info-toggle", "aria-expanded": infoOpen, "aria-controls": infoContentId, "aria-label": "How the trip speed slider works", onClick: () => setInfoOpen((previous) => !previous), children: "?" })] }), infoOpen && (_jsx("div", { className: "widget-card__info", id: infoContentId, children: _jsx("p", { children: "Drag the slider to vote on how fast the ferry should sail. The captain averages everyone's choice. Slower speeds cut CO\u2082 but add travel time. Faster speeds shorten the trip but use more fuel." }) })), _jsxs("div", { className: clsx("widget-card__slider-shell", config.variant === "reward-marker" && "widget-card__slider-shell--reward"), children: [_jsx("input", { id: `${config.id}-slider`, type: "range", min: minSpeedMultiplier, max: maxSpeedMultiplier, step: step, value: value, onChange: (event) => onValueChange(Number(event.target.value)), className: "widget-card__slider", style: { background: sliderBackground }, "aria-describedby": infoOpen ? infoContentId : undefined }), config.variant === "reward-marker" && typeof config.pace.rewardMarkerMultiplier === "number" && (_jsxs("span", { className: "widget-card__reward-marker", style: { left: `${clampedRewardMarkerPercent}%` }, children: [_jsx("span", { className: "widget-card__reward-marker-dot" }), _jsx("span", { className: "widget-card__reward-marker-copy", children: "Reward here!" })] }))] })] }), _jsxs("div", { className: clsx("widget-card__stats", `widget-card__stats--${config.variant}`), children: [config.variant === "mood" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Mood" }), _jsx("span", { className: "widget-card__stat-value", style: { color: moodAccent }, children: minutesDelta > 0 ? "Plenty of time" : minutesDelta < 0 ? "Racing" : "Balanced" })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Added time" }), _jsx("span", { className: "widget-card__stat-value", children: formatAddedMinutes(minutesDelta) })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Impact" }), _jsx("span", { className: "widget-card__stat-value", children: formatCo2Delta(co2DeltaKg) })] })] })), config.variant === "reward-marker" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Arrival" }), _jsx("span", { className: "widget-card__stat-value", children: formatMinutesDelta(minutesDelta) })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Reward" }), _jsx("span", { className: clsx("widget-card__stat-value", rewardUnlocked ? "widget-card__stat-value--positive" : "widget-card__stat-value--muted"), children: rewardUnlocked
                                            ? `Unlocked €${(config.rewardValueEur ?? 0).toFixed(2)}`
                                            : `Slide to the marker` })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "CO\u2082" }), _jsx("span", { className: "widget-card__stat-value", children: formatCo2Delta(co2DeltaKg) })] })] })), config.variant === "co2-only" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "widget-card__stat widget-card__stat--wide", children: [_jsx("span", { className: "widget-card__stat-label", children: "CO\u2082 savings" }), _jsx("span", { className: clsx("widget-card__stat-value widget-card__stat-value--xl", co2DeltaKg >= 0 ? "widget-card__stat-value--positive" : "widget-card__stat-value--muted"), children: formatCo2Delta(co2DeltaKg) }), _jsx("span", { className: "widget-card__stat-caption", children: "Based on ferry emissions curve (v\u00B3 rule)" })] }), _jsxs("div", { className: "widget-card__stat widget-card__stat--wide", children: [_jsx("span", { className: "widget-card__stat-label", children: "Timing" }), _jsx("span", { className: "widget-card__stat-value", children: formatMinutesDelta(minutesDelta) })] })] })), config.variant === "minimal" && (_jsxs(_Fragment, { children: [_jsx("div", { className: "widget-card__pill", children: minutesDelta > 0
                                    ? `Adds ${formatDuration(minutesDelta)}`
                                    : minutesDelta < 0
                                        ? `Saves ${formatDuration(Math.abs(minutesDelta))}`
                                        : "Keeps schedule" }), _jsx("div", { className: "widget-card__pill", children: reductionPct >= 0
                                    ? `Eco score +${Math.round(Math.max(reductionPct, 0))}`
                                    : `Eco score ${Math.round(reductionPct)}` }), _jsx("div", { className: "widget-card__pill", children: co2DeltaKg >= 0 ? formatCo2Delta(co2DeltaKg) : "No savings at this pace" })] }))] }), config.variant === "reward-marker" && showHints && (_jsxs("p", { className: "widget-card__hint", children: ["Hit the marker for a small thank-you: \u20AC", (config.rewardValueEur ?? 0).toFixed(2), " kiosk voucher."] })), config.variant === "co2-only" && showHints && (_jsx("p", { className: "widget-card__hint", children: "This view focuses purely on emissions. Shift left to see the gains; shift right and you burn extra fuel with no perks." })), showFootnote && config.footnote && _jsx("p", { className: "widget-card__footnote", children: config.footnote })] }));
}
