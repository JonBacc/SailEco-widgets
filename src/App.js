import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import WidgetVariant, { computeCo2DeltaKg, computeMinutesDelta, computeReductionPct, computeSpeedDeltaPct, computeTravelMinutes, } from "./components/WidgetVariant";
const CO2_PER_MINUTE = 520 / 120;
const DEFAULT_PACE_RANGE = {
    minSpeedMultiplier: 0.75,
    maxSpeedMultiplier: 1.1,
    step: 0.01,
};
const SCENARIOS = [
    {
        id: "scenario-stockholm-weekend",
        formKey: "stockholm-weekend",
        title: "Stockholm weekend getaway",
        description: "You and three friends are sailing from Helsinki to Stockholm on Thursday evening for a long weekend. You plan to enjoy slow breakfast on board before docking, after which you plan to wander the city, visit a gallery, and enjoy the summer.",
        operatorLine: "Tallink Silja · Silja Serenade",
        routeTitle: "Helsinki → Stockholm · Weekend cruise",
        travelMeta: [
            { label: "Travel date", value: "Thu 5 Jun 2026" },
            { label: "Passengers", value: "4 adults" },
            { label: "Cabin", value: "Promenade family suite" },
            { label: "Extras", value: "Brunch + spa passes" },
        ],
        pace: {
            baselineMinutes: 1005,
            baselineCo2Kg: Math.round(CO2_PER_MINUTE * 1005),
            ...DEFAULT_PACE_RANGE,
            minSpeedMultiplier: 0.9,
            maxSpeedMultiplier: 1.05,
            defaultSpeedMultiplier: 1,
        },
        departure: {
            portLabel: "Depart",
            portName: "Helsinki South Harbour Olympia",
            time: "17:00",
        },
        arrival: {
            portLabel: "Arrive",
            portName: "Stockholm Värtahamnen",
            time: "09:45 (next morning, usual pace)",
        },
        fareLines: [
            { label: "Cabin bundle", value: "€328" },
            { label: "Dinner seating", value: "€96" },
            { label: "Spa access", value: "€60" },
            { label: "Port fees", value: "€24" },
            { label: "Total today", value: "€508", emphasize: true },
        ],
        widget: {
            badge: "Mood vibes",
            footnote: "Slide left to take a calmer crossing. Slide right if you want to reach Stockholm a little earlier.",
        },
    },
    {
        id: "scenario-tallinn-daytrip",
        formKey: "tallinn-daytrip",
        title: "Tallinn day trip",
        description: "You're heading over from Helsinki to Tallinn for an after lunch client meeting. You need a calm ride to prepare, but you'd still like to be back home on the evening ferry.",
        operatorLine: "Tallink Silja · Megastar",
        routeTitle: "Helsinki → Tallinn · Day trip schedule",
        travelMeta: [
            { label: "Travel date", value: "Tue 10 Jun 2026" },
            { label: "Passenger", value: "1 adult" },
            { label: "Seat", value: "Comfort lounge" },
            { label: "Agenda", value: "Meetings + co-working" },
        ],
        pace: {
            baselineMinutes: 120,
            baselineCo2Kg: Math.round(CO2_PER_MINUTE * 120),
            ...DEFAULT_PACE_RANGE,
            minSpeedMultiplier: 0.75,
            maxSpeedMultiplier: 1.1,
            defaultSpeedMultiplier: 1,
        },
        departure: {
            portLabel: "Depart",
            portName: "Helsinki West Harbour T2",
            time: "08:30",
        },
        arrival: {
            portLabel: "Arrive",
            portName: "Tallinn Old City Harbour D",
            time: "10:30 (usual pace)",
        },
        fareLines: [
            { label: "Crossing fare", value: "€62" },
            { label: "Lounge desk", value: "€25" },
            { label: "Fast track", value: "€15" },
            { label: "Coffee punch card", value: "€8" },
            { label: "Total today", value: "€110", emphasize: true },
        ],
        widget: {
            badge: "Mood vibes",
            footnote: "Slide left for a smoother trip with extra quiet time. Slide right to keep the schedule tight for meetings.",
        },
    },
    {
        id: "scenario-germany-run",
        formKey: "germany-run",
        title: "Overnight ferry to Germany",
        description: "You and a friend are sailing overnight from Helsinki to Travemünde in your camper van to start a northern Germany road trip. You want to sleep well and arrive rested for the drive.",
        operatorLine: "Finnlines · Finnstar",
        routeTitle: "Helsinki → Travemünde · Overnight sailing",
        travelMeta: [
            { label: "Travel date", value: "Sun 27 Jul 2026" },
            { label: "Passengers", value: "2 adults" },
            { label: "Cabin", value: "Outside duo cabin" },
            { label: "Vehicle", value: "Camper van deck 7" },
        ],
        pace: {
            baselineMinutes: 720,
            baselineCo2Kg: Math.round(CO2_PER_MINUTE * 720),
            ...DEFAULT_PACE_RANGE,
            minSpeedMultiplier: 0.86,
            maxSpeedMultiplier: 1.08,
            defaultSpeedMultiplier: 1,
        },
        departure: {
            portLabel: "Depart",
            portName: "Helsinki Vuosaari Harbour",
            time: "21:00",
        },
        arrival: {
            portLabel: "Arrive",
            portName: "Travemünde Skandinavienkai",
            time: "09:00 (next morning, usual pace)",
        },
        fareLines: [
            { label: "Sailing fare", value: "€198" },
            { label: "Vehicle deck", value: "€112" },
            { label: "Dinner buffet", value: "€46" },
            { label: "Fuel surcharge", value: "€28" },
            { label: "Total today", value: "€384", emphasize: true },
        ],
        widget: {
            badge: "Mood vibes",
            footnote: "Slide left to slow down for more sleep and steadier seas. Slide right to dock earlier and hit the road sooner.",
        },
    },
    {
        id: "scenario-tankar-escape",
        formKey: "tankar-escape",
        title: "Tankar lighthouse overnight",
        description: "It's mid-June and you and three friends are taking the boat from Kokkola to Tankar island. You want time to walk the trails, watch the sunset from the lighthouse, and settle into the old keeper's quarters for the night.",
        operatorLine: "Visit Kokkola · M/S Jenny",
        routeTitle: "Kokkola → Tankar · Island visit",
        travelMeta: [
            { label: "Travel date", value: "Sat 14 Jun 2026" },
            { label: "Passengers", value: "4 friends" },
            { label: "Stay", value: "Keeper's quarters bunkroom" },
            { label: "Gear", value: "Weekend packs + guitar" },
        ],
        pace: {
            baselineMinutes: 75,
            baselineCo2Kg: Math.round(CO2_PER_MINUTE * 75),
            ...DEFAULT_PACE_RANGE,
            minSpeedMultiplier: 0.75,
            maxSpeedMultiplier: 1.12,
            defaultSpeedMultiplier: 1,
        },
        departure: {
            portLabel: "Depart",
            portName: "Kokkola Meripuisto pier",
            time: "14:00",
        },
        arrival: {
            portLabel: "Arrive",
            portName: "Tankar Lighthouse jetty",
            time: "15:15 (usual pace)",
        },
        fareLines: [
            { label: "Island tickets", value: "€120" },
            { label: "Overnight stay", value: "€160" },
            { label: "Sauna bundle", value: "€48" },
            { label: "Harbour fee", value: "€12" },
            { label: "Total today", value: "€340", emphasize: true },
        ],
        widget: {
            badge: "Mood vibes",
            footnote: "Slide left for an easy cruise with more time on deck. Slide right to arrive at the island a bit sooner.",
        },
    },
    {
        id: "scenario-umea-vaasa-return",
        formKey: "umea-vaasa-return",
        title: "Sunday night home to Vaasa",
        description: "It's Sunday evening after a packed weekend in Umeå. You and your partner are taking the late ferry home to Vaasa so you can be at work first thing Monday. You're weighing extra rest on board against getting into bed on time.",
        operatorLine: "Wasaline · Aurora Botnia",
        routeTitle: "Umeå → Vaasa · Evening return",
        travelMeta: [
            { label: "Travel date", value: "Sun 3 Aug 2026" },
            { label: "Passengers", value: "2 adults" },
            { label: "Cabin", value: "Evening lounge seats" },
            { label: "Extras", value: "Takeaway dinner + coffee" },
        ],
        pace: {
            baselineMinutes: 240,
            baselineCo2Kg: Math.round(CO2_PER_MINUTE * 240),
            ...DEFAULT_PACE_RANGE,
            minSpeedMultiplier: 0.85,
            maxSpeedMultiplier: 1.08,
            defaultSpeedMultiplier: 1,
        },
        departure: {
            portLabel: "Depart",
            portName: "Umeå Holmsund Terminal",
            time: "20:00",
        },
        arrival: {
            portLabel: "Arrive",
            portName: "Vaasa Passenger Harbour",
            time: "23:45 (usual pace)",
        },
        fareLines: [
            { label: "Sailing fare", value: "€148" },
            { label: "Evening lounge", value: "€48" },
            { label: "Vehicle deck", value: "€74" },
            { label: "Fuel surcharge", value: "€18" },
            { label: "Total today", value: "€288", emphasize: true },
        ],
        widget: {
            badge: "Mood vibes",
            footnote: "Slide left for a calmer ride and time to reset. Slide right to reach Vaasa and your bed sooner.",
        },
    },
    {
        id: "scenario-winter-crossing",
        formKey: "winter-crossing",
        title: "Winter evening to Tallinn",
        description: "It's a dark December evening with light snow in the forecast. You promised to check on a family member in Tallinn after work and still want the crossing to feel steady and warm.",
        operatorLine: "Tallink Silja · Star",
        routeTitle: "Helsinki → Tallinn · Winter crossing",
        travelMeta: [
            { label: "Travel date", value: "Mon 8 Dec 2026" },
            { label: "Passenger", value: "1 adult" },
            { label: "Cabin", value: "Business cabin" },
            { label: "Conditions", value: "1.5 m swell" },
        ],
        pace: {
            baselineMinutes: 120,
            baselineCo2Kg: Math.round(CO2_PER_MINUTE * 120),
            ...DEFAULT_PACE_RANGE,
            minSpeedMultiplier: 0.75,
            maxSpeedMultiplier: 1.1,
            defaultSpeedMultiplier: 1,
        },
        departure: {
            portLabel: "Depart",
            portName: "Helsinki West Harbour T2",
            time: "18:15",
        },
        arrival: {
            portLabel: "Arrive",
            portName: "Tallinn Old City Harbour D",
            time: "20:15 (usual pace)",
        },
        fareLines: [
            { label: "Crossing fare", value: "€139" },
            { label: "Business lounge", value: "€42" },
            { label: "Flex change", value: "€22" },
            { label: "Port fees", value: "€18" },
            { label: "Total today", value: "€221", emphasize: true },
        ],
        widget: {
            badge: "Mood vibes",
            footnote: "Slide left to keep the winter ride gentle and comfortable. Slide right to stay exactly on schedule.",
        },
    },
];
const AGE_GROUP_OPTIONS = [
    { value: "under-18", label: "Under 18" },
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45-54", label: "45-54" },
    { value: "55-64", label: "55-64" },
    { value: "65-plus", label: "65+" },
];
const OCCUPANCY_OPTIONS = [
    { value: "student", label: "Student" },
    { value: "working-full-time", label: "Working full time" },
    { value: "working-part-time", label: "Working part time" },
    { value: "self-employed", label: "Self-employed" },
    { value: "caregiver", label: "Primary caregiver" },
    { value: "retired", label: "Retired" },
    { value: "looking-for-work", label: "Looking for work" },
    { value: "other", label: "Other" },
];
function createInitialWidgetValues() {
    return SCENARIOS.reduce((accumulator, scenario) => {
        accumulator[scenario.id] = scenario.pace.defaultSpeedMultiplier ?? 1;
        return accumulator;
    }, {});
}
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
function formatSpeedMultiplier(multiplier) {
    return multiplier.toFixed(2);
}
function formatSpeedPctDelta(deltaPct) {
    if (Math.abs(deltaPct) < 0.5) {
        return "0% speed";
    }
    const rounded = Math.round(deltaPct);
    const sign = rounded > 0 ? "+" : "";
    return `${sign}${rounded}% speed`;
}
export default function App() {
    const [values, setValues] = useState(() => createInitialWidgetValues());
    const [submissionState, setSubmissionState] = useState("idle");
    const [errorMessage, setErrorMessage] = useState(null);
    const [stageIndex, setStageIndex] = useState(0);
    const formRef = useRef(null);
    const totalStages = SCENARIOS.length + 2; // intro + scenario panels + final submit
    const isFinalStage = stageIndex === totalStages - 1;
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [stageIndex]);
    const widgetSummaries = useMemo(() => {
        return SCENARIOS.map((scenario) => {
            const selectedMultiplier = values[scenario.id];
            const travelMinutes = computeTravelMinutes(scenario.pace.baselineMinutes, selectedMultiplier);
            const minutesDelta = computeMinutesDelta(scenario.pace.baselineMinutes, selectedMultiplier);
            const reductionPct = computeReductionPct(selectedMultiplier);
            const speedDeltaPct = computeSpeedDeltaPct(selectedMultiplier);
            const co2DeltaKg = computeCo2DeltaKg(scenario.pace.baselineCo2Kg, selectedMultiplier);
            return {
                id: scenario.id,
                formKey: scenario.formKey,
                title: scenario.title,
                selectedSpeedMultiplier: Number(selectedMultiplier.toFixed(2)),
                travelMinutes,
                minutesDelta,
                reductionPct: Number(reductionPct.toFixed(2)),
                speedDeltaPct: Number(speedDeltaPct.toFixed(2)),
                co2DeltaKg: Number(co2DeltaKg.toFixed(2)),
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
        setValues(createInitialWidgetValues());
        setSubmissionState("idle");
        setErrorMessage(null);
        setStageIndex(0);
        if (formRef.current) {
            formRef.current.reset();
        }
    };
    const handleReturnToStart = () => {
        handleResetFlow();
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
    return (_jsx("div", { className: "page-shell", children: _jsxs("form", { ref: formRef, className: "stage-form", name: "widget-values-for-scenarios", method: "POST", "data-netlify": "true", "data-netlify-honeypot": "bot-field", onSubmit: handleSubmit, children: [_jsx("input", { type: "hidden", name: "form-name", value: "widget-values-for-scenarios" }), _jsx("p", { className: "honeypot", "aria-hidden": "true", children: _jsxs("label", { children: ["Don't fill this out if you are human:", _jsx("input", { name: "bot-field" })] }) }), _jsx("div", { className: "view-viewport", children: _jsxs("div", { className: "view-rail", style: { transform: `translateX(-${stageIndex * 100}%)` }, "aria-live": "polite", children: [_jsx("section", { className: "view-panel view-panel--intro", "aria-hidden": stageIndex !== 0, children: _jsxs("div", { className: "landing-card", children: [_jsx("span", { className: "masthead__eyebrow", children: "PaceCtrl demo" }), _jsx("h1", { className: "landing-card__title", children: "Explore how one PaceCtrl trip speed slider works in six booking scenarios" }), _jsx("p", { className: "landing-card__lede", children: "You will see six different booking situations, all using the same PaceCtrl widget. Read the scenario, move the slider to what feels right, and continue to the next screen to record your choice. At the end there will also be an option to give some feedback, which will help us in the development." }), _jsx("button", { type: "button", className: "primary-button", onClick: handleStartFlow, children: "Start the survey" })] }) }), SCENARIOS.map((scenario, index) => (_jsx("section", { className: "view-panel view-panel--booking", "aria-hidden": stageIndex !== index + 1, children: _jsxs("div", { className: "booking-shell", children: [_jsxs("div", { className: "booking-shell__scenario-card", role: "note", children: [_jsxs("span", { className: "booking-shell__scenario-chip", children: ["Scenario ", index + 1] }), _jsx("h3", { className: "booking-shell__scenario-title", children: scenario.title }), _jsx("p", { className: "booking-shell__scenario-copy", children: scenario.description })] }), _jsxs("header", { className: "booking-shell__header", children: [_jsxs("div", { className: "booking-shell__header-main", children: [_jsx("p", { className: "booking-shell__operator", children: scenario.operatorLine }), _jsx("h2", { className: "booking-shell__route", children: scenario.routeTitle })] }), _jsxs("div", { className: "booking-shell__header-aux", children: [_jsx("ul", { className: "booking-shell__meta", children: scenario.travelMeta.map((meta) => (_jsxs("li", { className: "booking-shell__meta-item", children: [_jsxs("span", { className: "booking-shell__meta-label", children: [meta.label, ":"] }), _jsx("span", { className: "booking-shell__meta-value", children: meta.value })] }, meta.label))) }), _jsx("button", { type: "button", className: "to-start-button", onClick: handleResetFlow, children: "To the start" })] })] }), _jsxs("div", { className: "booking-shell__grid", children: [_jsxs("div", { className: "booking-shell__summary", children: [_jsxs("div", { className: "booking-shell__itinerary booking-shell__itinerary--inline", children: [_jsxs("div", { children: [_jsx("p", { className: "booking-shell__port-label", children: scenario.departure.portLabel }), _jsx("p", { className: "booking-shell__port-value", children: scenario.departure.portName }), _jsx("p", { className: "booking-shell__time", children: scenario.departure.time })] }), _jsx("div", { className: "booking-shell__itinerary-arrow", "aria-hidden": "true", children: "\u2192" }), _jsxs("div", { children: [_jsx("p", { className: "booking-shell__port-label", children: scenario.arrival.portLabel }), _jsx("p", { className: "booking-shell__port-value", children: scenario.arrival.portName }), _jsx("p", { className: "booking-shell__time", children: scenario.arrival.time })] })] }), scenario.widget.footnote && (_jsxs("p", { className: "booking-shell__widget-hint", role: "note", children: [_jsx("span", { className: "booking-shell__widget-hint-label", children: "Hint" }), " ", scenario.widget.footnote] })), _jsx("div", { className: "booking-shell__widget-slot", children: _jsx(WidgetVariant, { config: {
                                                                    id: scenario.id,
                                                                    variant: "mood",
                                                                    badge: scenario.widget.badge,
                                                                    footnote: scenario.widget.footnote,
                                                                    pace: scenario.pace,
                                                                }, value: values[scenario.id], onValueChange: (value) => handleWidgetChange(scenario.id, value), compact: true }) }), _jsx("dl", { className: "booking-shell__fare-breakdown", children: scenario.fareLines.map((line) => (_jsxs("div", { className: line.emphasize ? "booking-shell__fare-total" : undefined, children: [_jsx("dt", { children: line.label }), _jsx("dd", { children: line.value })] }, line.label))) }), _jsx("div", { className: "booking-shell__actions", children: _jsx("button", { type: "button", className: "pay-button", onClick: handleAdvanceStage, children: "Save & next scenario" }) })] }), _jsxs("span", { className: "widget-step-indicator widget-step-indicator--footer", children: ["Scenario ", index + 1, " of ", SCENARIOS.length] })] })] }) }, scenario.id))), _jsx("section", { className: "view-panel view-panel--final", "aria-hidden": !isFinalStage, children: _jsxs("div", { className: "final-card", children: [_jsx("h2", { children: "Send the PaceCtrl widget selections" }), _jsx("p", { children: "We capture slider speeds and their travel / CO\u2082 deltas to understand how different contexts shape choices. If you have a moment, these optional details help us compare results across groups." }), _jsxs("fieldset", { className: "final-card__fieldset", children: [_jsxs("legend", { className: "final-card__legend", children: ["Age group ", _jsx("span", { className: "final-card__optional", children: "(optional)" })] }), _jsx("div", { className: "final-card__choices", children: AGE_GROUP_OPTIONS.map((option) => (_jsxs("label", { className: "final-card__choice", children: [_jsx("input", { type: "radio", name: "participant_age_group", value: option.value }), _jsx("span", { children: option.label })] }, option.value))) })] }), _jsxs("fieldset", { className: "final-card__fieldset", children: [_jsxs("legend", { className: "final-card__legend", children: ["Occupancy ", _jsx("span", { className: "final-card__optional", children: "(optional)" })] }), _jsx("div", { className: "final-card__choices", children: OCCUPANCY_OPTIONS.map((option) => (_jsxs("label", { className: "final-card__choice", children: [_jsx("input", { type: "radio", name: "participant_occupancy", value: option.value }), _jsx("span", { children: option.label })] }, option.value))) })] }), _jsx("label", { className: "final-card__feedback-label", htmlFor: "survey-feedback", children: "Optional feedback (Finnish, Swedish, or English)" }), _jsx("textarea", { id: "survey-feedback", name: "participant_feedback", className: "final-card__feedback", placeholder: "Tell us how the widget felt, what confused you, or what you liked.", rows: 4 }), _jsx("button", { type: "button", className: "to-start-button to-start-button--inline", onClick: handleResetFlow, children: "To the start" }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "submit", className: "submit-button", disabled: submissionState === "submitting", children: submissionState === "submitting" ? "Submitting…" : "Submit widget values" }), submissionState === "success" && (_jsx("p", { className: "form-feedback form-feedback--success", children: "Thanks! The widget selections were sent." })), submissionState === "error" && (_jsxs("p", { className: "form-feedback form-feedback--error", children: ["Something went wrong. ", errorMessage ?? "Please try again."] }))] })] }) })] }) }), widgetSummaries.map((summary) => {
                    const widgetLabel = summary.title;
                    return (_jsxs(Fragment, { children: [_jsx("input", { type: "hidden", name: `${summary.formKey}_widget_name`, value: widgetLabel }), _jsx("input", { type: "hidden", name: `${summary.formKey}_arrival_minutes_delta`, value: formatMinutesDelta(summary.minutesDelta) }), _jsx("input", { type: "hidden", name: `${summary.formKey}_co2_delta_kg`, value: formatCo2DeltaSigned(summary.co2DeltaKg) }), _jsx("input", { type: "hidden", name: `${summary.formKey}_speed_multiplier`, value: formatSpeedMultiplier(summary.selectedSpeedMultiplier) }), _jsx("input", { type: "hidden", name: `${summary.formKey}_speed_pct_delta`, value: formatSpeedPctDelta(summary.speedDeltaPct) })] }, `hidden-${summary.id}`));
                }), submissionState === "success" && (_jsx("div", { className: "final-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "final-overlay-title", children: _jsxs("div", { className: "final-overlay__content", children: [_jsx("h3", { id: "final-overlay-title", children: "Thank you for filling in the survey!" }), _jsx("p", { className: "final-overlay__description", children: "We have received your selections." }), _jsx("button", { type: "button", className: "final-overlay__button", onClick: handleReturnToStart, children: "Go back to start" })] }) }))] }) }));
}
