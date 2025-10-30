import { FormEvent, Fragment, useMemo, useState } from "react";
import WidgetVariant, {
  computeCo2DeltaKg,
  computeMinutesDelta,
  computeReductionPct,
  computeTravelMinutes,
  isRewardUnlocked,
  SPEED_DEFAULT,
  WidgetVariantConfig,
} from "./components/WidgetVariant";

const WIDGET_CONFIGS: WidgetVariantConfig[] = [
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

type WidgetId = typeof WIDGET_CONFIGS[number]["id"];
type WidgetValues = Record<WidgetId, number>;

type SubmissionState = "idle" | "submitting" | "success" | "error";

const BASE_FARE_EUR = 129;

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

function formatSpeedKnots(speed: number) {
  return speed.toFixed(2);
}

export default function App() {
  const [values, setValues] = useState<WidgetValues>(() => {
    return WIDGET_CONFIGS.reduce<WidgetValues>((accumulator, widget) => {
      accumulator[widget.id] = SPEED_DEFAULT;
      return accumulator;
    }, {} as WidgetValues);
  });
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const handleWidgetChange = (id: WidgetId, value: number) => {
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
        name="widget-values"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="widget-values" />
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
                <h1 className="landing-card__title">Explore how the SailEco widget could live in booking flows</h1>
                <p className="landing-card__lede">
                  You will step through four mock booking moments from Tallink Siljaline. Each screen keeps the same layout, but the
                  widget above the price changes. Adjust the slider, then continue to the next mock checkout step.
                </p>
                <button type="button" className="primary-button" onClick={handleStartFlow}>
                  Start submitting form
                </button>
              </div>
            </section>

            {WIDGET_CONFIGS.map((config, index) => (
              <section
                key={config.id}
                className="view-panel view-panel--booking"
                aria-hidden={stageIndex !== index + 1}
              >
                <div className="booking-shell">
                  <header className="booking-shell__header">
                    <div>
                      <p className="booking-shell__operator">Tallink Siljaline · Megastar</p>
                      <h2 className="booking-shell__route">Helsinki → Tallinn · Evening departure</h2>
                    </div>
                    <div className="booking-shell__header-aux">
                      <div className="booking-shell__meta">
                        <span>Travel date: 30 Oct 2025</span>
                        <span>Passengers: 2 adults</span>
                        <span>Cabin: A-Class</span>
                      </div>
                      <button type="button" className="to-start-button" onClick={handleResetFlow}>
                        To the start
                      </button>
                    </div>
                  </header>

                  <div className="booking-shell__grid">
                    <div className="booking-shell__summary">
                      <div className="booking-shell__itinerary booking-shell__itinerary--inline">
                        <div>
                          <p className="booking-shell__port-label">Depart</p>
                          <p className="booking-shell__port-value">Helsinki West Harbour T2</p>
                          <p className="booking-shell__time">18:30</p>
                        </div>
                        <div className="booking-shell__itinerary-arrow" aria-hidden="true">→</div>
                        <div>
                          <p className="booking-shell__port-label">Arrive</p>
                          <p className="booking-shell__port-value">Tallinn Old City Harbour D</p>
                          <p className="booking-shell__time">20:30 (usual pace)</p>
                        </div>
                      </div>

                      <div className="booking-shell__widget-slot">
                        <WidgetVariant
                          config={config}
                          value={values[config.id]}
                          onValueChange={(value) => handleWidgetChange(config.id, value)}
                          compact
                        />
                      </div>

                      <dl className="booking-shell__fare-breakdown">
                        <div>
                          <dt>Cabin fare</dt>
                          <dd>€{BASE_FARE_EUR}</dd>
                        </div>
                        <div>
                          <dt>Port fees</dt>
                          <dd>€18</dd>
                        </div>
                        <div>
                          <dt>Carbon offset</dt>
                          <dd>Included</dd>
                        </div>
                        <div className="booking-shell__fare-total">
                          <dt>Total today</dt>
                          <dd>€{BASE_FARE_EUR + 18}</dd>
                        </div>
                      </dl>
                      <div className="booking-shell__actions">
                        <button type="button" className="pay-button" onClick={handleAdvanceStage}>
                          Pay (Move to next widget)
                        </button>
                      </div>
                    </div>
                    <span className="widget-step-indicator widget-step-indicator--footer">
                      Widget {index + 1} of {WIDGET_CONFIGS.length}
                    </span>
                  </div>
                </div>
              </section>
            ))}

            <section className="view-panel view-panel--final" aria-hidden={!isFinalStage}>
              <div className="final-card">
                <h2>Send the SailEco widget selections</h2>
                <p>
                  Thanks for walking through the mock booking flow. We only capture widget speeds and their travel / CO₂ deltas to
                  understand which copy resonates. We never ask for names, contact details, or anything personally identifiable.
                </p>
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
          const widgetLabel = summary.badge ?? summary.variant;
          return (
            <Fragment key={`hidden-${summary.id}`}>
              <input type="hidden" name={`${summary.id}_widget_name`} value={widgetLabel} />
              <input
                type="hidden"
                name={`${summary.id}_arrival_minutes_delta`}
                value={formatMinutesDelta(summary.minutesDelta)}
              />
              <input
                type="hidden"
                name={`${summary.id}_co2_delta_kg`}
                value={formatCo2DeltaSigned(summary.co2DeltaKg)}
              />
              <input
                type="hidden"
                name={`${summary.id}_speed_kn`}
                value={formatSpeedKnots(summary.selectedSpeedKn)}
              />
            </Fragment>
          );
        })}
      </form>
    </div>
  );
}
