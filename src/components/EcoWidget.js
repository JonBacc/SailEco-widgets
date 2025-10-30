import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
export default function EcoWidget(props) {
    const { id, label, vessel, speedMin, speedMax, speedDefault, rewardThresholdPct, rewardValueEur, value, onValueChange, } = props;
    const reductionPct = useMemo(() => {
        return Math.max(0, ((speedDefault - value) / speedDefault) * 100);
    }, [speedDefault, value]);
    const minutesDelta = useMemo(() => {
        return Math.max(0, Math.round(((speedDefault - value) / speedDefault) * 60));
    }, [speedDefault, value]);
    const qualifiesForReward = reductionPct >= rewardThresholdPct;
    const sliderId = `${id}-speed-slider`;
    return (_jsxs("article", { className: "eco-widget", "aria-labelledby": `${id}-heading`, children: [_jsxs("header", { className: "eco-widget__header", children: [_jsx("span", { className: "eco-widget__label", id: `${id}-heading`, children: label }), _jsxs("span", { className: "eco-widget__vessel", children: ["Vessel: ", vessel] })] }), _jsxs("div", { className: "eco-widget__body", children: [_jsxs("label", { className: "eco-widget__control", htmlFor: sliderId, children: [_jsx("span", { className: "eco-widget__control-label", children: "Voyage speed" }), _jsx("input", { id: sliderId, type: "range", min: speedMin, max: speedMax, step: 0.5, value: value, onChange: (event) => onValueChange(Number(event.target.value)) })] }), _jsxs("dl", { className: "eco-widget__stats", children: [_jsxs("div", { children: [_jsx("dt", { children: "Selected speed" }), _jsxs("dd", { children: [value.toFixed(1), " kn"] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Time change" }), _jsxs("dd", { children: ["+", minutesDelta, " min vs default"] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Reduction" }), _jsxs("dd", { children: ["\u2212", reductionPct.toFixed(1), "%"] })] })] }), _jsx("p", { className: `eco-widget__reward ${qualifiesForReward ? "eco-widget__reward--ready" : ""}`, children: qualifiesForReward
                            ? `🎁 Reward unlocked · €${rewardValueEur.toFixed(2)} kiosk voucher`
                            : `Slide to at least −${rewardThresholdPct.toFixed(1)}% to unlock the reward` })] }), _jsxs("footer", { className: "eco-widget__footnote", children: ["Default speed ", speedDefault.toFixed(1), " kn \u00B7 Range ", speedMin.toFixed(1), "\u2013", speedMax.toFixed(1), " kn"] })] }));
}
