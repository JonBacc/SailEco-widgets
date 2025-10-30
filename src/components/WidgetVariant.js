import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import clsx from "clsx";
import { useMemo } from "react";
export const SPEED_MIN = 14;
export const SPEED_MAX = 22;
export const SPEED_DEFAULT = 19;
export const DEFAULT_TRAVEL_MINUTES = 120;
export const DEFAULT_CO2_KG = 520;
export const REWARD_TOLERANCE = 0.25;
export function computeTravelMinutes(speedKnots) {
    const travelMinutes = DEFAULT_TRAVEL_MINUTES * (SPEED_DEFAULT / speedKnots);
    return Math.round(travelMinutes);
}
export function computeMinutesDelta(speedKnots) {
    return computeTravelMinutes(speedKnots) - DEFAULT_TRAVEL_MINUTES;
}
export function computeReductionPct(speedKnots) {
    return ((SPEED_DEFAULT - speedKnots) / SPEED_DEFAULT) * 100;
}
export function computeCo2DeltaKg(speedKnots) {
    const normalizedSpeed = speedKnots / SPEED_DEFAULT;
    const emissionRatio = Math.pow(normalizedSpeed, 3);
    const delta = DEFAULT_CO2_KG * (1 - emissionRatio);
    return delta;
}
export function isRewardUnlocked(config, value) {
    if (!config.rewardMarkerSpeed) {
        return false;
    }
    return value <= config.rewardMarkerSpeed + REWARD_TOLERANCE;
}
function formatDuration(totalMinutes) {
    const sign = totalMinutes < 0 ? "-" : "";
    const absolute = Math.abs(totalMinutes);
    const hours = Math.floor(absolute / 60);
    const minutes = absolute % 60;
    return `${sign}${hours}h ${minutes.toString().padStart(2, "0")}m`;
}
function formatMinutesDelta(minutesDelta) {
    if (minutesDelta === 0) {
        return "Same arrival time";
    }
    if (minutesDelta > 0) {
        return `Arrives +${minutesDelta} min later`;
    }
    return `Arrives ${Math.abs(minutesDelta)} min earlier`;
}
function formatCo2Delta(deltaKg) {
    const rounded = Math.abs(Math.round(deltaKg));
    if (deltaKg >= 0) {
        return `Saves ${rounded} kg CO₂`;
    }
    return `Adds ${rounded} kg CO₂`;
}
export default function WidgetVariant({ config, value, onValueChange, compact = false }) {
    const reductionPct = useMemo(() => computeReductionPct(value), [value]);
    const travelMinutes = useMemo(() => computeTravelMinutes(value), [value]);
    const minutesDelta = useMemo(() => computeMinutesDelta(value), [value]);
    const co2DeltaKg = useMemo(() => computeCo2DeltaKg(value), [value]);
    const normalized = (value - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
    const clampedNormalized = Math.min(Math.max(normalized, 0), 1);
    const moodHue = 120 * (1 - clampedNormalized);
    const moodBackground = `linear-gradient(180deg, hsl(${moodHue}, 82%, 92%) 0%, #ffffff 100%)`;
    const moodAccent = `hsl(${moodHue}, 70%, 38%)`;
    const sliderFillPercent = Math.round(clampedNormalized * 100);
    const sliderBackground = `linear-gradient(90deg, rgba(15,157,88,0.65) 0%, rgba(15,157,88,0.65) ${sliderFillPercent}%, rgba(192,57,43,0.45) ${sliderFillPercent}%, rgba(192,57,43,0.45) 100%)`;
    const rewardUnlocked = isRewardUnlocked(config, value);
    const rewardMarkerPercent = config.rewardMarkerSpeed
        ? ((config.rewardMarkerSpeed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100
        : 0;
    const clampedRewardMarkerPercent = Math.min(Math.max(rewardMarkerPercent, 0), 100);
    const isCompact = compact;
    const showContext = !isCompact;
    const showHints = !isCompact;
    const showFootnote = !isCompact && Boolean(config.footnote);
    return (_jsxs("article", { className: clsx("widget-card", `widget-card--${config.variant}`, isCompact && "widget-card--compact"), style: config.variant === "mood" ? { background: moodBackground } : undefined, children: [showContext && (_jsxs("header", { className: "widget-card__header", children: [_jsxs("div", { className: "widget-card__topline", children: [_jsx("span", { className: "widget-card__operator", children: "Tallink \u00B7 Megastar" }), config.badge && _jsx("span", { className: "widget-card__badge", children: config.badge })] }), _jsx("h2", { className: "widget-card__route", children: "Helsinki \u2192 Tallinn" }), _jsx("span", { className: "widget-card__meta", children: "Usual pace 2h 00m \u00B7 Tonight's sea state calm" })] })), _jsxs("div", { className: "widget-card__control", children: [_jsx("label", { className: "widget-card__slider-label", htmlFor: `${config.id}-slider`, children: "Trip pace" }), _jsxs("div", { className: clsx("widget-card__slider-shell", config.variant === "reward-marker" && "widget-card__slider-shell--reward"), children: [_jsx("input", { id: `${config.id}-slider`, type: "range", min: SPEED_MIN, max: SPEED_MAX, step: 0.25, value: value, onChange: (event) => onValueChange(Number(event.target.value)), className: "widget-card__slider", style: { background: sliderBackground } }), config.variant === "reward-marker" && config.rewardMarkerSpeed && (_jsxs("span", { className: "widget-card__reward-marker", style: { left: `${clampedRewardMarkerPercent}%` }, children: [_jsx("span", { className: "widget-card__reward-marker-dot" }), _jsx("span", { className: "widget-card__reward-marker-copy", children: "Reward here!" })] }))] })] }), _jsxs("div", { className: clsx("widget-card__stats", `widget-card__stats--${config.variant}`), children: [config.variant === "mood" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Mood" }), _jsx("span", { className: "widget-card__stat-value", style: { color: moodAccent }, children: minutesDelta > 0 ? "Plenty of time" : minutesDelta < 0 ? "Racing" : "Balanced" })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Travel time" }), _jsx("span", { className: "widget-card__stat-value", children: formatDuration(travelMinutes) })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Impact" }), _jsx("span", { className: "widget-card__stat-value", children: formatCo2Delta(co2DeltaKg) })] })] })), config.variant === "reward-marker" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Arrival" }), _jsx("span", { className: "widget-card__stat-value", children: formatMinutesDelta(minutesDelta) })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "Reward" }), _jsx("span", { className: clsx("widget-card__stat-value", rewardUnlocked ? "widget-card__stat-value--positive" : "widget-card__stat-value--muted"), children: rewardUnlocked
                                            ? `Unlocked €${(config.rewardValueEur ?? 0).toFixed(2)}`
                                            : `Slide to the marker` })] }), _jsxs("div", { className: "widget-card__stat", children: [_jsx("span", { className: "widget-card__stat-label", children: "CO\u2082" }), _jsx("span", { className: "widget-card__stat-value", children: formatCo2Delta(co2DeltaKg) })] })] })), config.variant === "co2-only" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "widget-card__stat widget-card__stat--wide", children: [_jsx("span", { className: "widget-card__stat-label", children: "CO\u2082 savings" }), _jsx("span", { className: clsx("widget-card__stat-value widget-card__stat-value--xl", co2DeltaKg >= 0 ? "widget-card__stat-value--positive" : "widget-card__stat-value--muted"), children: formatCo2Delta(co2DeltaKg) }), _jsx("span", { className: "widget-card__stat-caption", children: "Based on ferry emissions curve (v\u00B3 rule)" })] }), _jsxs("div", { className: "widget-card__stat widget-card__stat--wide", children: [_jsx("span", { className: "widget-card__stat-label", children: "Timing" }), _jsx("span", { className: "widget-card__stat-value", children: formatMinutesDelta(minutesDelta) })] })] })), config.variant === "minimal" && (_jsxs(_Fragment, { children: [_jsx("div", { className: "widget-card__pill", children: minutesDelta > 0 ? `Adds ${minutesDelta} min` : minutesDelta < 0 ? `Saves ${Math.abs(minutesDelta)} min` : "Keeps schedule" }), _jsx("div", { className: "widget-card__pill", children: reductionPct >= 0
                                    ? `Eco score +${Math.round(Math.max(reductionPct, 0))}`
                                    : `Eco score ${Math.round(reductionPct)}` }), _jsx("div", { className: "widget-card__pill", children: co2DeltaKg >= 0 ? formatCo2Delta(co2DeltaKg) : "No savings at this pace" })] }))] }), config.variant === "reward-marker" && showHints && (_jsxs("p", { className: "widget-card__hint", children: ["Hit the marker for a small thank-you: \u20AC", (config.rewardValueEur ?? 0).toFixed(2), " kiosk voucher."] })), config.variant === "co2-only" && showHints && (_jsx("p", { className: "widget-card__hint", children: "This view focuses purely on emissions. Shift left to see the gains; shift right and you burn extra fuel with no perks." })), showFootnote && config.footnote && _jsx("p", { className: "widget-card__footnote", children: config.footnote })] }));
}
