import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import WidgetVariant, {
  computeCo2DeltaKg,
  computeMinutesDelta,
  computeReductionPct,
  computeSpeedDeltaPct,
  computeTravelMinutes,
  WidgetPaceConfig,
  WidgetVariantConfig,
} from "./components/WidgetVariant";

type ScenarioFareLine = {
  label: string;
  value: string;
  emphasize?: boolean;
};

type ScenarioMetaItem = {
  label: string;
  value: string;
};

type Scenario = {
  id: string;
  formKey: string;
  title: string;
  description: string;
  operatorLine: string;
  routeTitle: string;
  travelMeta: ScenarioMetaItem[];
  pace: WidgetPaceConfig;
  departure: {
    portLabel: string;
    portName: string;
    time: string;
  };
  arrival: {
    portLabel: string;
    portName: string;
    time: string;
  };
  fareLines: ScenarioFareLine[];
  widget: Pick<WidgetVariantConfig, "badge" | "footnote">;
};

const CO2_PER_MINUTE = 520 / 120;
const DEFAULT_PACE_RANGE = {
  minSpeedMultiplier: 0.75,
  maxSpeedMultiplier: 1.1,
  step: 0.01,
} as const;

const SCENARIOS: Scenario[] = [
  {
    id: "scenario-stockholm-weekend",
    formKey: "stockholm-weekend",
    title: "Stockholm weekend getaway",
    description:
      "You and three friends are sailing from Helsinki to Stockholm on Thursday evening for a long weekend. You plan to enjoy slow breakfast on board before docking, after which you plan to wander the city, visit a gallery, and enjoy the summer.",
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
    description:
      "You're heading over from Helsinki to Tallinn for an after lunch client meeting. You need a calm ride to prepare, but you'd still like to be back home on the evening ferry.",
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
    description:
      "You and a friend are sailing overnight from Helsinki to Travemünde in your camper van to start a northern Germany road trip. You want to sleep well and arrive rested for the drive.",
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
    description:
      "It's mid-June and you and three friends are taking the boat from Kokkola to Tankar island. You want time to walk the trails, watch the sunset from the lighthouse, and settle into the old keeper's quarters for the night.",
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
    description:
      "It's Sunday evening after a packed weekend in Umeå. You and your partner are taking the late ferry home to Vaasa so you can be at work first thing Monday. You're weighing extra rest on board against getting into bed on time.",
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
    description:
      "It's a dark December evening with light snow in the forecast. You promised to check on a family member in Tallinn after work and still want the crossing to feel steady and warm.",
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

type ScenarioId = Scenario["id"];
type WidgetValues = Record<ScenarioId, number>;

type SubmissionState = "idle" | "submitting" | "success" | "error";

function encodeFormData(formData: FormData) {
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    params.append(key, String(value));
  });
  return params.toString();
}

function formatMinutesDelta(minutesDelta: number) {
  if (minutesDelta === 0) {
    return "0";
  }
  const rounded = Math.round(Math.abs(minutesDelta));
  return minutesDelta > 0 ? `+${rounded}` : `-${rounded}`;
}

function formatCo2DeltaSigned(deltaKg: number) {
  if (deltaKg === 0) {
    return "0";
  }
  const rounded = Math.round(Math.abs(deltaKg));
  // Positive delta indicates a CO₂ saving, which we report as a negative change in emissions.
  return deltaKg > 0 ? `-${rounded}` : `+${rounded}`;
}

function formatSpeedMultiplier(multiplier: number) {
  return multiplier.toFixed(2);
}

function formatSpeedPctDelta(deltaPct: number) {
  if (Math.abs(deltaPct) < 0.5) {
    return "0% speed";
  }
  const rounded = Math.round(deltaPct);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}% speed`;
}

export default function App() {
  const [values, setValues] = useState<WidgetValues>(() => {
    return SCENARIOS.reduce<WidgetValues>((accumulator, scenario) => {
      accumulator[scenario.id] = scenario.pace.defaultSpeedMultiplier ?? 1;
      return accumulator;
    }, {} as WidgetValues);
  });
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);

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

  const handleWidgetChange = (id: ScenarioId, value: number) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSubmissionState("error");
    }
  };

  return (
    <div className="page-shell">
      <form
        className="stage-form"
        name="widget-values-for-scenarios"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="widget-values-for-scenarios" />
        <p className="honeypot" aria-hidden="true">
          <label>
            Don&apos;t fill this out if you are human:
            <input name="bot-field" />
          </label>
        </p>

        <div className="view-viewport">
          <div
            className="view-rail"
            style={{ transform: `translateX(-${stageIndex * 100}%)` }}
            aria-live="polite"
          >
            <section className="view-panel view-panel--intro" aria-hidden={stageIndex !== 0}>
              <div className="landing-card">
                <span className="masthead__eyebrow">SailEco demo</span>
                <h1 className="landing-card__title">Explore how one SailEco mood widget adapts to five booking scenarios</h1>
                <p className="landing-card__lede">
                  You will see five different booking situations, all using the same SailEco mood widget. Read the scenario, move the
                  slider to what feels right, and continue to the next screen to record your choice. At the end there will also be an option to give a comment.
                </p>
                <button type="button" className="primary-button" onClick={handleStartFlow}>
                  Start the survey
                </button>
              </div>
            </section>

            {SCENARIOS.map((scenario, index) => (
              <section
                key={scenario.id}
                className="view-panel view-panel--booking"
                aria-hidden={stageIndex !== index + 1}
              >
                <div className="booking-shell">
                  <div className="booking-shell__scenario-card" role="note">
                    <span className="booking-shell__scenario-chip">Scenario {index + 1}</span>
                    <h3 className="booking-shell__scenario-title">{scenario.title}</h3>
                    <p className="booking-shell__scenario-copy">{scenario.description}</p>
                  </div>
                  <header className="booking-shell__header">
                    <div className="booking-shell__header-main">
                      <p className="booking-shell__operator">{scenario.operatorLine}</p>
                      <h2 className="booking-shell__route">{scenario.routeTitle}</h2>
                    </div>
                    <div className="booking-shell__header-aux">
                      <ul className="booking-shell__meta">
                        {scenario.travelMeta.map((meta) => (
                          <li className="booking-shell__meta-item" key={meta.label}>
                            <span className="booking-shell__meta-label">{meta.label}:</span>
                            <span className="booking-shell__meta-value">{meta.value}</span>
                          </li>
                        ))}
                      </ul>
                      <button type="button" className="to-start-button" onClick={handleResetFlow}>
                        To the start
                      </button>
                    </div>
                  </header>

                  <div className="booking-shell__grid">
                    <div className="booking-shell__summary">
                      <div className="booking-shell__itinerary booking-shell__itinerary--inline">
                        <div>
                          <p className="booking-shell__port-label">{scenario.departure.portLabel}</p>
                          <p className="booking-shell__port-value">{scenario.departure.portName}</p>
                          <p className="booking-shell__time">{scenario.departure.time}</p>
                        </div>
                        <div className="booking-shell__itinerary-arrow" aria-hidden="true">→</div>
                        <div>
                          <p className="booking-shell__port-label">{scenario.arrival.portLabel}</p>
                          <p className="booking-shell__port-value">{scenario.arrival.portName}</p>
                          <p className="booking-shell__time">{scenario.arrival.time}</p>
                        </div>
                      </div>

                      {scenario.widget.footnote && (
                        <p className="booking-shell__widget-hint" role="note">
                          <span className="booking-shell__widget-hint-label">Hint</span>
                          {" "}
                          {scenario.widget.footnote}
                        </p>
                      )}
                      <div className="booking-shell__widget-slot">
                        <WidgetVariant
                          config={{
                            id: scenario.id,
                            variant: "mood",
                            badge: scenario.widget.badge,
                            footnote: scenario.widget.footnote,
                            pace: scenario.pace,
                          }}
                          value={values[scenario.id]}
                          onValueChange={(value) => handleWidgetChange(scenario.id, value)}
                          compact
                        />
                      </div>

                      <dl className="booking-shell__fare-breakdown">
                        {scenario.fareLines.map((line) => (
                          <div
                            key={line.label}
                            className={line.emphasize ? "booking-shell__fare-total" : undefined}
                          >
                            <dt>{line.label}</dt>
                            <dd>{line.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="booking-shell__actions">
                        <button type="button" className="pay-button" onClick={handleAdvanceStage}>
                          Save &amp; next scenario
                        </button>
                      </div>
                    </div>
                    <span className="widget-step-indicator widget-step-indicator--footer">
                      Scenario {index + 1} of {SCENARIOS.length}
                    </span>
                  </div>
                </div>
              </section>
            ))}

            <section className="view-panel view-panel--final" aria-hidden={!isFinalStage}>
              <div className="final-card">
                <h2>Send the SailEco widget selections</h2>
                <p>
                  Thanks for completing the six scenarios. We only capture slider speeds and their travel / CO₂ deltas to see how
                  people react in different contexts. We never ask for personal details.
                </p>
                <label className="final-card__feedback-label" htmlFor="survey-feedback">
                  Optional feedback (Finnish, Swedish, or English)
                </label>
                <textarea
                  id="survey-feedback"
                  name="participant_feedback"
                  className="final-card__feedback"
                  placeholder="Tell us how the widget felt, what confused you, or what you liked."
                  rows={4}
                />
                <button type="button" className="to-start-button to-start-button--inline" onClick={handleResetFlow}>
                  To the start
                </button>
                <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={submissionState === "submitting"}>
                    {submissionState === "submitting" ? "Submitting…" : "Submit widget values"}
                  </button>
                  {submissionState === "success" && (
                    <p className="form-feedback form-feedback--success">Thanks! The widget selections were sent.</p>
                  )}
                  {submissionState === "error" && (
                    <p className="form-feedback form-feedback--error">
                      Something went wrong. {errorMessage ?? "Please try again."}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {widgetSummaries.map((summary) => {
          const widgetLabel = summary.title;
          return (
            <Fragment key={`hidden-${summary.id}`}>
              <input type="hidden" name={`${summary.formKey}_widget_name`} value={widgetLabel} />
              <input
                type="hidden"
                name={`${summary.formKey}_arrival_minutes_delta`}
                value={formatMinutesDelta(summary.minutesDelta)}
              />
              <input
                type="hidden"
                name={`${summary.formKey}_co2_delta_kg`}
                value={formatCo2DeltaSigned(summary.co2DeltaKg)}
              />
              <input
                type="hidden"
                name={`${summary.formKey}_speed_multiplier`}
                value={formatSpeedMultiplier(summary.selectedSpeedMultiplier)}
              />
              <input
                type="hidden"
                name={`${summary.formKey}_speed_pct_delta`}
                value={formatSpeedPctDelta(summary.speedDeltaPct)}
              />
            </Fragment>
          );
        })}
      </form>
    </div>
  );
}
