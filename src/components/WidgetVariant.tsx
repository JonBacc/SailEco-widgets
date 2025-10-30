import clsx from "clsx";
import { useMemo } from "react";

export const SPEED_MIN = 14;
export const SPEED_MAX = 22;
export const SPEED_DEFAULT = 19;
export const DEFAULT_TRAVEL_MINUTES = 120;
export const DEFAULT_CO2_KG = 520;

export type WidgetVariantType = "mood" | "reward-marker" | "co2-only" | "minimal";

export type WidgetVariantConfig = {
  id: string;
  variant: WidgetVariantType;
  badge?: string;
  footnote?: string;
  rewardMarkerSpeed?: number;
  rewardValueEur?: number;
};

export type WidgetVariantProps = {
  config: WidgetVariantConfig;
  value: number;
  onValueChange: (value: number) => void;
};

export const REWARD_TOLERANCE = 0.25;

export function computeTravelMinutes(speedKnots: number) {
  const travelMinutes = DEFAULT_TRAVEL_MINUTES * (SPEED_DEFAULT / speedKnots);
  return Math.round(travelMinutes);
}

export function computeMinutesDelta(speedKnots: number) {
  return computeTravelMinutes(speedKnots) - DEFAULT_TRAVEL_MINUTES;
}

export function computeReductionPct(speedKnots: number) {
  return ((SPEED_DEFAULT - speedKnots) / SPEED_DEFAULT) * 100;
}

export function computeCo2DeltaKg(speedKnots: number) {
  const normalizedSpeed = speedKnots / SPEED_DEFAULT;
  const emissionRatio = Math.pow(normalizedSpeed, 3);
  const delta = DEFAULT_CO2_KG * (1 - emissionRatio);
  return delta;
}

export function isRewardUnlocked(config: WidgetVariantConfig, value: number) {
  if (!config.rewardMarkerSpeed) {
    return false;
  }
  return value <= config.rewardMarkerSpeed + REWARD_TOLERANCE;
}

function formatDuration(totalMinutes: number) {
  const sign = totalMinutes < 0 ? "-" : "";
  const absolute = Math.abs(totalMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `${sign}${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

function formatMinutesDelta(minutesDelta: number) {
  if (minutesDelta === 0) {
    return "Same arrival time";
  }
  if (minutesDelta > 0) {
    return `Arrives +${minutesDelta} min later`;
  }
  return `Arrives ${Math.abs(minutesDelta)} min earlier`;
}

function formatCo2Delta(deltaKg: number) {
  const rounded = Math.abs(Math.round(deltaKg));
  if (deltaKg >= 0) {
    return `Saves ${rounded} kg CO₂`;
  }
  return `Adds ${rounded} kg CO₂`;
}

export default function WidgetVariant({ config, value, onValueChange }: WidgetVariantProps) {
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
  const sliderBackground = `linear-gradient(90deg, rgba(15,157,88,0.65) 0%, rgba(15,157,88,0.65) ${
    sliderFillPercent
  }%, rgba(192,57,43,0.45) ${sliderFillPercent}%, rgba(192,57,43,0.45) 100%)`;

  const rewardUnlocked = isRewardUnlocked(config, value);

  const rewardMarkerPercent = config.rewardMarkerSpeed
    ? ((config.rewardMarkerSpeed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100
    : 0;
  const clampedRewardMarkerPercent = Math.min(Math.max(rewardMarkerPercent, 0), 100);

  return (
    <article
      className={clsx("widget-card", `widget-card--${config.variant}`)}
      style={config.variant === "mood" ? { background: moodBackground } : undefined}
    >
      <header className="widget-card__header">
        <div className="widget-card__topline">
          <span className="widget-card__operator">Tallink · Megastar</span>
          {config.badge && <span className="widget-card__badge">{config.badge}</span>}
        </div>
        <h2 className="widget-card__route">Helsinki → Tallinn</h2>
        <span className="widget-card__meta">Usual pace 2h 00m · Tonight&apos;s sea state calm</span>
      </header>

      <div className="widget-card__control">
        <label className="widget-card__slider-label" htmlFor={`${config.id}-slider`}>
          Trip pace
        </label>
        <div
          className={clsx(
            "widget-card__slider-shell",
            config.variant === "reward-marker" && "widget-card__slider-shell--reward"
          )}
        >
          <input
            id={`${config.id}-slider`}
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.25}
            value={value}
            onChange={(event) => onValueChange(Number(event.target.value))}
            className="widget-card__slider"
            style={{ background: sliderBackground }}
          />
          {config.variant === "reward-marker" && config.rewardMarkerSpeed && (
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
              <span className="widget-card__stat-label">Travel time</span>
              <span className="widget-card__stat-value">{formatDuration(travelMinutes)}</span>
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
              {minutesDelta > 0 ? `Adds ${minutesDelta} min` : minutesDelta < 0 ? `Saves ${Math.abs(minutesDelta)} min` : "Keeps schedule"}
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

      {config.variant === "reward-marker" && (
        <p className="widget-card__hint">
          Hit the marker for a small thank-you: €{(config.rewardValueEur ?? 0).toFixed(2)} kiosk voucher.
        </p>
      )}

      {config.variant === "co2-only" && (
        <p className="widget-card__hint">
          This view focuses purely on emissions. Shift left to see the gains; shift right and you burn extra fuel with no perks.
        </p>
      )}

      {config.footnote && <p className="widget-card__footnote">{config.footnote}</p>}
    </article>
  );
}
