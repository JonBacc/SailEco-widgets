import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
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
function encodeFormData(formData) {
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
        params.append(key, String(value));
    });
    return params.toString();
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
    const widgetNarrative = useMemo(() => {
        const formatMinutes = (delta) => {
            if (delta > 0)
                return `+${delta}`;
            if (delta < 0)
                return `${delta}`;
            return "+0";
        };
        const formatImpact = (deltaKg) => {
            const magnitude = Math.round(Math.abs(deltaKg));
            const prefix = deltaKg >= 0 ? "-" : "+";
            return `${prefix}${magnitude}`;
        };
        return widgetSummaries
            .map((summary) => {
            const label = summary.badge ? summary.badge.toUpperCase() : summary.variant.toUpperCase();
            const travelSnippet = `Travel Time ${formatMinutes(summary.minutesDelta)}min.`;
            const impactSnippet = `Impact ${formatImpact(summary.co2DeltaKg)}kg CO₂.`;
            return `${label}: ${travelSnippet} ${impactSnippet}`;
        })
            .join("\n");
    }, [widgetSummaries]);
    const handleWidgetChange = (id, value) => {
        setValues((previous) => ({
            ...previous,
            [id]: value,
        }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmissionState("submitting");
        setErrorMessage(null);
        try {
            const form = event.currentTarget;
            const formData = new FormData(form);
            formData.set("widgetNarrative", widgetNarrative);
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
    return (_jsxs("div", { className: "page-shell", children: [_jsxs("header", { className: "masthead", children: [_jsx("span", { className: "masthead__eyebrow", children: "SailEco demo" }), _jsx("h1", { className: "masthead__title", children: "A few looks at the SailEco speed widget" }), _jsx("p", { className: "masthead__lede", children: "Same Megastar route, a few different UI styles. Drag each slider to explore how copy, colour, and rewards shift for a greener pace. When you are done, submit the selections at the bottom by clicking \"Submit widget values\". Note that this form is totally anonymous, and we won't be able to link your selections back to you." })] }), _jsx("main", { children: _jsxs("form", { className: "widget-form", name: "widget-values", method: "POST", "data-netlify": "true", "data-netlify-honeypot": "bot-field", onSubmit: handleSubmit, children: [_jsx("input", { type: "hidden", name: "form-name", value: "widget-values" }), _jsx("p", { className: "honeypot", "aria-hidden": "true", children: _jsxs("label", { children: ["Don't fill this out if you are human:", _jsx("input", { name: "bot-field" })] }) }), _jsx("section", { className: "widget-stack", children: WIDGET_CONFIGS.map((config, index) => (_jsxs("div", { className: "widget-panel", children: [_jsx(WidgetVariant, { config: config, value: values[config.id], onValueChange: (value) => handleWidgetChange(config.id, value) }), index < WIDGET_CONFIGS.length - 1 && _jsx("div", { className: "widget-divider", role: "presentation" })] }, config.id))) }), _jsx("input", { type: "hidden", name: "widgetNarrative", value: widgetNarrative }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "submit", className: "submit-button", disabled: submissionState === "submitting", children: submissionState === "submitting" ? "Submitting…" : "Submit widget values" }), submissionState === "success" && (_jsx("p", { className: "form-feedback form-feedback--success", children: "Thanks! The widget selections were sent." })), submissionState === "error" && (_jsxs("p", { className: "form-feedback form-feedback--error", children: ["Something went wrong. ", errorMessage ?? "Please try again."] }))] })] }) }), _jsx("footer", { className: "page-footer", children: _jsx("p", { children: "All widget values are submitted anonymously for demo purposes. No personal data is collected. This helps us evaluate what kind of slider works the best." }) })] }));
}
