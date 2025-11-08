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
export declare const REWARD_TOLERANCE = 0.02;
export declare function computeTravelMinutes(baselineMinutes: number, speedMultiplier: number): number;
export declare function computeMinutesDelta(baselineMinutes: number, speedMultiplier: number): number;
export declare function computeReductionPct(speedMultiplier: number): number;
export declare function computeSpeedDeltaPct(speedMultiplier: number): number;
export declare function computeCo2DeltaKg(baselineCo2Kg: number, speedMultiplier: number): number;
export declare function isRewardUnlocked(config: WidgetVariantConfig, value: number): boolean;
export default function WidgetVariant({ config, value, onValueChange, compact }: WidgetVariantProps): import("react/jsx-runtime").JSX.Element;
