import { useMemo } from "react";

type EcoWidgetProps = {
  id: string;
  label: string;
  vessel: string;
  speedMin: number;
  speedMax: number;
  speedDefault: number;
  rewardThresholdPct: number;
  rewardValueEur: number;
  value: number;
  onValueChange: (value: number) => void;
};

export default function EcoWidget(props: EcoWidgetProps) {
  const {
    id,
    label,
    vessel,
    speedMin,
    speedMax,
    speedDefault,
    rewardThresholdPct,
    rewardValueEur,
    value,
    onValueChange,
  } = props;

  const reductionPct = useMemo(() => {
    return Math.max(0, ((speedDefault - value) / speedDefault) * 100);
  }, [speedDefault, value]);

  const minutesDelta = useMemo(() => {
    return Math.max(0, Math.round(((speedDefault - value) / speedDefault) * 60));
  }, [speedDefault, value]);

  const qualifiesForReward = reductionPct >= rewardThresholdPct;

  const sliderId = `${id}-speed-slider`;

  return (
    <article className="eco-widget" aria-labelledby={`${id}-heading`}>
      <header className="eco-widget__header">
        <span className="eco-widget__label" id={`${id}-heading`}>
          {label}
        </span>
        <span className="eco-widget__vessel">Vessel: {vessel}</span>
      </header>

      <div className="eco-widget__body">
        <label className="eco-widget__control" htmlFor={sliderId}>
          <span className="eco-widget__control-label">Voyage speed</span>
          <input
            id={sliderId}
            type="range"
            min={speedMin}
            max={speedMax}
            step={0.5}
            value={value}
            onChange={(event) => onValueChange(Number(event.target.value))}
          />
        </label>

        <dl className="eco-widget__stats">
          <div>
            <dt>Selected speed</dt>
            <dd>{value.toFixed(1)} kn</dd>
          </div>
          <div>
            <dt>Time change</dt>
            <dd>+{minutesDelta} min vs default</dd>
          </div>
          <div>
            <dt>Reduction</dt>
            <dd>−{reductionPct.toFixed(1)}%</dd>
          </div>
        </dl>

        <p className={`eco-widget__reward ${qualifiesForReward ? "eco-widget__reward--ready" : ""}`}>
          {qualifiesForReward
            ? `🎁 Reward unlocked · €${rewardValueEur.toFixed(2)} kiosk voucher`
            : `Slide to at least −${rewardThresholdPct.toFixed(1)}% to unlock the reward`}
        </p>
      </div>

      <footer className="eco-widget__footnote">
        Default speed {speedDefault.toFixed(1)} kn · Range {speedMin.toFixed(1)}–{speedMax.toFixed(1)} kn
      </footer>
    </article>
  );
}
