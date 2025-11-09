import clsx from "clsx";
import { useMemo, useState } from "react";

export type WidgetVariantType = "mood" | "reward-marker" | "co2-only" | "minimal";

export type WidgetPaceConfig = {
  baselineMinutes: number;
  baselineCo2Kg: number;
  minSpeedMultiplier: number;
  maxSpeedMultiplier: number;
  step?: number;
  rewardMarkerMultiplier?: number;
  defaultSpeedMultiplier?: number;
};

export type WidgetVariantConfig = {
  id: string;
  variant: WidgetVariantType;
  badge?: string;
  footnote?: string;
  rewardValueEur?: number;
  pace: WidgetPaceConfig;
};

export type WidgetVariantProps = {
  config: WidgetVariantConfig;
  value: number;
  onValueChange: (value: number) => void;
  compact?: boolean;
};

export const REWARD_TOLERANCE = 0.02;

export function computeTravelMinutes(baselineMinutes: number, speedMultiplier: number) {
  const travelMinutes = baselineMinutes / speedMultiplier;
  return Math.round(travelMinutes);
}

export function computeMinutesDelta(baselineMinutes: number, speedMultiplier: number) {
  return computeTravelMinutes(baselineMinutes, speedMultiplier) - baselineMinutes;
}

export function computeReductionPct(speedMultiplier: number) {
  return (1 - speedMultiplier) * 100;
}

export function computeSpeedDeltaPct(speedMultiplier: number) {
  return (speedMultiplier - 1) * 100;
}

export function computeCo2DeltaKg(baselineCo2Kg: number, speedMultiplier: number) {
  const emissionRatio = Math.pow(speedMultiplier, 3);
  const delta = baselineCo2Kg * (1 - emissionRatio);
  return delta;
}

export function isRewardUnlocked(config: WidgetVariantConfig, value: number) {
  const marker = config.pace.rewardMarkerMultiplier;
  if (typeof marker !== "number") {
    return false;
  }
  return value <= marker + REWARD_TOLERANCE;
}

function formatDuration(minutes: number) {
  const totalMinutes = Math.max(0, Math.round(Math.abs(minutes)));
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const parts: string[] = [];
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

function formatMinutesDelta(minutesDelta: number) {
  if (minutesDelta === 0) {
    return "Same arrival time";
  }
  const duration = formatDuration(Math.abs(minutesDelta));
  if (minutesDelta > 0) {
    return `Arrives +${duration} later`;
  }
  return `Arrives ${duration} earlier`;
}

function formatAddedMinutes(minutesDelta: number) {
  if (minutesDelta === 0) {
    return "No change";
  }
  const sign = minutesDelta > 0 ? "+" : "-";
  const duration = formatDuration(Math.abs(minutesDelta));
  return `${sign}${duration}`;
}

function formatCo2Delta(deltaKg: number) {
  const rounded = Math.abs(Math.round(deltaKg));
  if (deltaKg >= 0) {
    return `Saves ${rounded} kg CO₂`;
  }
  return `Adds ${rounded} kg CO₂`;
}

export default function WidgetVariant({ config, value, onValueChange, compact = false }: WidgetVariantProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const {
    baselineMinutes,
    baselineCo2Kg,
    minSpeedMultiplier,
    maxSpeedMultiplier,
    step = 0.02,
  } = config.pace;

  const reductionPct = useMemo(() => computeReductionPct(value), [value]);
  const minutesDelta = useMemo(() => computeMinutesDelta(baselineMinutes, value), [baselineMinutes, value]);
  const co2DeltaKg = useMemo(() => computeCo2DeltaKg(baselineCo2Kg, value), [baselineCo2Kg, value]);

  const normalized = (value - minSpeedMultiplier) / (maxSpeedMultiplier - minSpeedMultiplier);
  const clampedNormalized = Math.min(Math.max(normalized, 0), 1);
  const moodHue = 120 * (1 - clampedNormalized);
  const moodBackground = `linear-gradient(180deg, hsl(${moodHue}, 82%, 92%) 0%, #ffffff 100%)`;
  const moodAccent = `hsl(${moodHue}, 70%, 38%)`;
  const sliderFillPercent = Math.round(clampedNormalized * 100);
  const sliderBackground = `linear-gradient(90deg, rgba(15,157,88,0.65) 0%, rgba(15,157,88,0.65) ${
    sliderFillPercent
  }%, rgba(192,57,43,0.45) ${sliderFillPercent}%, rgba(192,57,43,0.45) 100%)`;

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

  return (
    <article
      className={clsx(
        "widget-card",
        `widget-card--${config.variant}`,
        isCompact && "widget-card--compact"
      )}
      style={config.variant === "mood" ? { background: moodBackground } : undefined}
    >
      {showContext && (
        <header className="widget-card__header">
          <div className="widget-card__topline">
            <span className="widget-card__operator">Tallink · Megastar</span>
            {config.badge && <span className="widget-card__badge">{config.badge}</span>}
          </div>
          <h2 className="widget-card__route">Helsinki → Tallinn</h2>
          <span className="widget-card__meta">Usual pace 2h 00m · Tonight&apos;s sea state calm</span>
        </header>
      )}

      <div className="widget-card__control">
        <div className="widget-card__control-header">
          <label className="widget-card__slider-label" htmlFor={`${config.id}-slider`}>
            Vote on the trip speed
          </label>
          <button
            type="button"
            className="widget-card__info-toggle"
            aria-expanded={infoOpen}
            aria-controls={infoContentId}
            aria-label="How the trip speed slider works"
            onClick={() => setInfoOpen((previous) => !previous)}
          >
            ?
          </button>
        </div>
        {infoOpen && (
          <div className="widget-card__info" id={infoContentId}>
            <p>
              Drag the slider to vote on how fast the ferry should sail. The captain averages everyone's choice. Slower speeds cut
              CO2 but add travel time. Faster speeds shorten the trip but use more fuel. Fuel use climbs fast with speed: doubling the
              pace can push emissions to roughly four times higher.
            </p>
          </div>
        )}
        <div
          className={clsx(
            "widget-card__slider-shell",
            config.variant === "reward-marker" && "widget-card__slider-shell--reward"
          )}
        >
          <input
            id={`${config.id}-slider`}
            type="range"
            min={minSpeedMultiplier}
            max={maxSpeedMultiplier}
            step={step}
            value={value}
            onChange={(event) => onValueChange(Number(event.target.value))}
            className="widget-card__slider"
            style={{ background: sliderBackground }}
            aria-describedby={infoOpen ? infoContentId : undefined}
          />
          {config.variant === "reward-marker" && typeof config.pace.rewardMarkerMultiplier === "number" && (
            <span
              className="widget-card__reward-marker"
              style={{ left: `${clampedRewardMarkerPercent}%` }}
            >
              <span className="widget-card__reward-marker-dot" />
              <span className="widget-card__reward-marker-copy">Reward here!</span>
            </span>
          )}
        </div>
      </div>

      <div className={clsx("widget-card__stats", `widget-card__stats--${config.variant}`)}>
        {config.variant === "mood" && (
          <>
            <div className="widget-card__stat">
              <span className="widget-card__stat-label">Mood</span>
              <span className="widget-card__stat-value" style={{ color: moodAccent }}>
                {minutesDelta > 0 ? "Plenty of time" : minutesDelta < 0 ? "Racing" : "Balanced"}
              </span>
            </div>
            <div className="widget-card__stat">
              <span className="widget-card__stat-label">Added time</span>
              <span className="widget-card__stat-value">{formatAddedMinutes(minutesDelta)}</span>
            </div>
            <div className="widget-card__stat">
              <span className="widget-card__stat-label">Impact</span>
              <span className="widget-card__stat-value">{formatCo2Delta(co2DeltaKg)}</span>
            </div>
          </>
        )}

        {config.variant === "reward-marker" && (
          <>
            <div className="widget-card__stat">
              <span className="widget-card__stat-label">Arrival</span>
              <span className="widget-card__stat-value">{formatMinutesDelta(minutesDelta)}</span>
            </div>
            <div className="widget-card__stat">
              <span className="widget-card__stat-label">Reward</span>
              <span
                className={clsx(
                  "widget-card__stat-value",
                  rewardUnlocked ? "widget-card__stat-value--positive" : "widget-card__stat-value--muted"
                )}
              >
                {rewardUnlocked
                  ? `Unlocked €${(config.rewardValueEur ?? 0).toFixed(2)}`
                  : `Slide to the marker`}
              </span>
            </div>
            <div className="widget-card__stat">
              <span className="widget-card__stat-label">CO₂</span>
              <span className="widget-card__stat-value">{formatCo2Delta(co2DeltaKg)}</span>
            </div>
          </>
        )}

        {config.variant === "co2-only" && (
          <>
            <div className="widget-card__stat widget-card__stat--wide">
              <span className="widget-card__stat-label">CO₂ savings</span>
              <span
                className={clsx(
                  "widget-card__stat-value widget-card__stat-value--xl",
                  co2DeltaKg >= 0 ? "widget-card__stat-value--positive" : "widget-card__stat-value--muted"
                )}
              >
                {formatCo2Delta(co2DeltaKg)}
              </span>
              <span className="widget-card__stat-caption">
                Based on ferry emissions curve (v³ rule)
              </span>
            </div>
            <div className="widget-card__stat widget-card__stat--wide">
              <span className="widget-card__stat-label">Timing</span>
              <span className="widget-card__stat-value">{formatMinutesDelta(minutesDelta)}</span>
            </div>
          </>
        )}

        {config.variant === "minimal" && (
          <>
            <div className="widget-card__pill">
              {minutesDelta > 0
                ? `Adds ${formatDuration(minutesDelta)}`
                : minutesDelta < 0
                ? `Saves ${formatDuration(Math.abs(minutesDelta))}`
                : "Keeps schedule"}
            </div>
            <div className="widget-card__pill">
              {reductionPct >= 0
                ? `Eco score +${Math.round(Math.max(reductionPct, 0))}`
                : `Eco score ${Math.round(reductionPct)}`}
            </div>
            <div className="widget-card__pill">
              {co2DeltaKg >= 0 ? formatCo2Delta(co2DeltaKg) : "No savings at this pace"}
            </div>
          </>
        )}
      </div>

      {config.variant === "reward-marker" && showHints && (
        <p className="widget-card__hint">
          Hit the marker for a small thank-you: €{(config.rewardValueEur ?? 0).toFixed(2)} kiosk voucher.
        </p>
      )}

      {config.variant === "co2-only" && showHints && (
        <p className="widget-card__hint">
          This view focuses purely on emissions. Shift left to see the gains; shift right and you burn extra fuel with no perks.
        </p>
      )}

      {showFootnote && config.footnote && <p className="widget-card__footnote">{config.footnote}</p>}
    </article>
  );
}
