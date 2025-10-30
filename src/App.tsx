import { FormEvent, useMemo, useState } from "react";
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

function encodeFormData(formData: FormData) {
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    params.append(key, String(value));
  });
  return params.toString();
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
    const formatMinutes = (delta: number) => {
      if (delta > 0) return `+${delta}`;
      if (delta < 0) return `${delta}`;
      return "+0";
    };

    const formatImpact = (deltaKg: number) => {
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

  const handleWidgetChange = (id: WidgetId, value: number) => {
    setValues((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSubmissionState("error");
    }
  };

  return (
    <div className="page-shell">
      <header className="masthead">
        <span className="masthead__eyebrow">SailEco demo</span>
        <h1 className="masthead__title">A few looks at the SailEco speed widget</h1>
        <p className="masthead__lede">
          Same Megastar route, a few different UI styles. Drag each slider to explore how copy, colour, and rewards shift for a
          greener pace. When you are done, submit the selections at the bottom by clicking "Submit widget values".
          Note that this form is totally anonymous, and we won&apos;t be able to link your selections back to you.
        </p>
      </header>

      <main>
        <form
          className="widget-form"
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

          <section className="widget-stack">
            {WIDGET_CONFIGS.map((config, index) => (
              <div key={config.id} className="widget-panel">
                <WidgetVariant
                  config={config}
                  value={values[config.id]}
                  onValueChange={(value) => handleWidgetChange(config.id, value)}
                />
                {index < WIDGET_CONFIGS.length - 1 && <div className="widget-divider" role="presentation" />}
              </div>
            ))}
          </section>

          <input type="hidden" name="widgetNarrative" value={widgetNarrative} />

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
        </form>
      </main>

      <footer className="page-footer">
        <p>
          All widget values are submitted anonymously for demo purposes. No personal data is collected. This helps us evaluate what kind of slider works the best.
        </p>
      </footer>
    </div>
  );
}
