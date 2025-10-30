import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useMemo, useState } from "react";
import WidgetVariant, { computeCo2DeltaKg, computeMinutesDelta, computeReductionPct, computeTravelMinutes, isRewardUnlocked, SPEED_DEFAULT, } from "./components/WidgetVariant";
const WIDGET_CONFIGS = [
    {
        id: "mood-card",
        variant: "mood",
        badge: "Smooth ride",
        footnote: "Colour shifts greener as passengers ease the pace.",
    },
    {
        id: "reward-marker",
        variant: "reward-marker",
        badge: "€2 kiosk reward",
        footnote: "Crew sees the reward unlock instantly once the pace crosses the marker.",
        rewardMarkerSpeed: 16.5,
        rewardValueEur: 2,
    },
    {
        id: "co2-focus",
        variant: "co2-only",
        badge: "Fuel impact",
        footnote: "Great for sustainability copy alongside payment buttons.",
    },
    {
        id: "minimal-pills",
        variant: "minimal",
        badge: "Quick summary",
        footnote: "Compact status chips for tighter checkout layouts.",
    },
];
const BASE_FARE_EUR = 129;
function encodeFormData(formData) {
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
        params.append(key, String(value));
    });
    return params.toString();
}
function formatMinutesDelta(minutesDelta) {
    if (minutesDelta === 0) {
        return "0";
    }
    const rounded = Math.round(Math.abs(minutesDelta));
    return minutesDelta > 0 ? `+${rounded}` : `-${rounded}`;
}
function formatCo2DeltaSigned(deltaKg) {
    if (deltaKg === 0) {
        return "0";
    }
    const rounded = Math.round(Math.abs(deltaKg));
    // Positive delta indicates a CO₂ saving, which we report as a negative change in emissions.
    return deltaKg > 0 ? `-${rounded}` : `+${rounded}`;
}
function formatSpeedKnots(speed) {
    return speed.toFixed(2);
}
export default function App() {
    const [values, setValues] = useState(() => {
        return WIDGET_CONFIGS.reduce((accumulator, widget) => {
            accumulator[widget.id] = SPEED_DEFAULT;
            return accumulator;
        }, {});
    });
    const [submissionState, setSubmissionState] = useState("idle");
    const [errorMessage, setErrorMessage] = useState(null);
    const [stageIndex, setStageIndex] = useState(0);
    const totalStages = WIDGET_CONFIGS.length + 2; // intro + widget panels + final submit
    const isFinalStage = stageIndex === totalStages - 1;
    const widgetSummaries = useMemo(() => {
        return WIDGET_CONFIGS.map((config) => {
            const selectedSpeed = values[config.id];
            const travelMinutes = computeTravelMinutes(selectedSpeed);
            const minutesDelta = computeMinutesDelta(selectedSpeed);
            const reductionPct = computeReductionPct(selectedSpeed);
            const co2DeltaKg = computeCo2DeltaKg(selectedSpeed);
            return {
                id: config.id,
                variant: config.variant,
                badge: config.badge,
                selectedSpeedKn: Number(selectedSpeed.toFixed(2)),
                travelMinutes,
                minutesDelta,
                reductionPct: Number(reductionPct.toFixed(2)),
                co2DeltaKg: Number(co2DeltaKg.toFixed(2)),
                rewardUnlocked: isRewardUnlocked(config, selectedSpeed),
            };
        });
    }, [values]);
    const handleWidgetChange = (id, value) => {
        setValues((previous) => ({
            ...previous,
            [id]: value,
        }));
    };
    const handleStartFlow = () => {
        setStageIndex(1);
    };
    const handleAdvanceStage = () => {
        setStageIndex((previous) => Math.min(previous + 1, totalStages - 1));
    };
    const handleResetFlow = () => {
        setStageIndex(0);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmissionState("submitting");
        setErrorMessage(null);
        try {
            const form = event.currentTarget;
            const formData = new FormData(form);
            await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: encodeFormData(formData),
            });
            setSubmissionState("success");
        }
        catch (error) {
            setErrorMessage(error.message);
            setSubmissionState("error");
        }
    };
    return (_jsx("div", { className: "page-shell", children: _jsxs("form", { className: "stage-form", name: "widget-values", method: "POST", "data-netlify": "true", "data-netlify-honeypot": "bot-field", onSubmit: handleSubmit, children: [_jsx("input", { type: "hidden", name: "form-name", value: "widget-values" }), _jsx("p", { className: "honeypot", "aria-hidden": "true", children: _jsxs("label", { children: ["Don't fill this out if you are human:", _jsx("input", { name: "bot-field" })] }) }), _jsx("div", { className: "view-viewport", children: _jsxs("div", { className: "view-rail", style: { transform: `translateX(-${stageIndex * 100}%)` }, "aria-live": "polite", children: [_jsx("section", { className: "view-panel view-panel--intro", "aria-hidden": stageIndex !== 0, children: _jsxs("div", { className: "landing-card", children: [_jsx("span", { className: "masthead__eyebrow", children: "SailEco demo" }), _jsx("h1", { className: "landing-card__title", children: "Explore how the SailEco widget could live in booking flows" }), _jsx("p", { className: "landing-card__lede", children: "You will step through four mock booking moments from Tallink Siljaline. Each screen keeps the same layout, but the widget above the price changes. Adjust the slider, then continue to the next mock checkout step." }), _jsx("button", { type: "button", className: "primary-button", onClick: handleStartFlow, children: "Start submitting form" })] }) }), WIDGET_CONFIGS.map((config, index) => (_jsx("section", { className: "view-panel view-panel--booking", "aria-hidden": stageIndex !== index + 1, children: _jsxs("div", { className: "booking-shell", children: [_jsxs("header", { className: "booking-shell__header", children: [_jsxs("div", { children: [_jsx("p", { className: "booking-shell__operator", children: "Tallink Siljaline \u00B7 Megastar" }), _jsx("h2", { className: "booking-shell__route", children: "Helsinki \u2192 Tallinn \u00B7 Evening departure" })] }), _jsxs("div", { className: "booking-shell__header-aux", children: [_jsxs("div", { className: "booking-shell__meta", children: [_jsx("span", { children: "Travel date: 30 Oct 2025" }), _jsx("span", { children: "Passengers: 2 adults" }), _jsx("span", { children: "Cabin: A-Class" })] }), _jsx("button", { type: "button", className: "to-start-button", onClick: handleResetFlow, children: "To the start" })] })] }), _jsxs("div", { className: "booking-shell__grid", children: [_jsxs("div", { className: "booking-shell__summary", children: [_jsxs("div", { className: "booking-shell__itinerary booking-shell__itinerary--inline", children: [_jsxs("div", { children: [_jsx("p", { className: "booking-shell__port-label", children: "Depart" }), _jsx("p", { className: "booking-shell__port-value", children: "Helsinki West Harbour T2" }), _jsx("p", { className: "booking-shell__time", children: "18:30" })] }), _jsx("div", { className: "booking-shell__itinerary-arrow", "aria-hidden": "true", children: "\u2192" }), _jsxs("div", { children: [_jsx("p", { className: "booking-shell__port-label", children: "Arrive" }), _jsx("p", { className: "booking-shell__port-value", children: "Tallinn Old City Harbour D" }), _jsx("p", { className: "booking-shell__time", children: "20:30 (usual pace)" })] })] }), _jsx("div", { className: "booking-shell__widget-slot", children: _jsx(WidgetVariant, { config: config, value: values[config.id], onValueChange: (value) => handleWidgetChange(config.id, value), compact: true }) }), _jsxs("dl", { className: "booking-shell__fare-breakdown", children: [_jsxs("div", { children: [_jsx("dt", { children: "Cabin fare" }), _jsxs("dd", { children: ["\u20AC", BASE_FARE_EUR] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Port fees" }), _jsx("dd", { children: "\u20AC18" })] }), _jsxs("div", { children: [_jsx("dt", { children: "Carbon offset" }), _jsx("dd", { children: "Included" })] }), _jsxs("div", { className: "booking-shell__fare-total", children: [_jsx("dt", { children: "Total today" }), _jsxs("dd", { children: ["\u20AC", BASE_FARE_EUR + 18] })] })] }), _jsx("div", { className: "booking-shell__actions", children: _jsx("button", { type: "button", className: "pay-button", onClick: handleAdvanceStage, children: "Pay (Move to next widget)" }) })] }), _jsxs("span", { className: "widget-step-indicator widget-step-indicator--footer", children: ["Widget ", index + 1, " of ", WIDGET_CONFIGS.length] })] })] }) }, config.id))), _jsx("section", { className: "view-panel view-panel--final", "aria-hidden": !isFinalStage, children: _jsxs("div", { className: "final-card", children: [_jsx("h2", { children: "Send the SailEco widget selections" }), _jsx("p", { children: "Thanks for walking through the mock booking flow. We only capture widget speeds and their travel / CO\u2082 deltas to understand which copy resonates. We never ask for names, contact details, or anything personally identifiable." }), _jsx("button", { type: "button", className: "to-start-button to-start-button--inline", onClick: handleResetFlow, children: "To the start" }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "submit", className: "submit-button", disabled: submissionState === "submitting", children: submissionState === "submitting" ? "Submitting…" : "Submit widget values" }), submissionState === "success" && (_jsx("p", { className: "form-feedback form-feedback--success", children: "Thanks! The widget selections were sent." })), submissionState === "error" && (_jsxs("p", { className: "form-feedback form-feedback--error", children: ["Something went wrong. ", errorMessage ?? "Please try again."] }))] })] }) })] }) }), widgetSummaries.map((summary) => {
                    const widgetLabel = summary.badge ?? summary.variant;
                    return (_jsxs(Fragment, { children: [_jsx("input", { type: "hidden", name: `${summary.id}_widget_name`, value: widgetLabel }), _jsx("input", { type: "hidden", name: `${summary.id}_arrival_minutes_delta`, value: formatMinutesDelta(summary.minutesDelta) }), _jsx("input", { type: "hidden", name: `${summary.id}_co2_delta_kg`, value: formatCo2DeltaSigned(summary.co2DeltaKg) }), _jsx("input", { type: "hidden", name: `${summary.id}_speed_kn`, value: formatSpeedKnots(summary.selectedSpeedKn) })] }, `hidden-${summary.id}`));
                })] }) }));
}
