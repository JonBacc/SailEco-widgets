export declare const SPEED_MIN = 14;
export declare const SPEED_MAX = 22;
export declare const SPEED_DEFAULT = 19;
export declare const DEFAULT_TRAVEL_MINUTES = 120;
export declare const DEFAULT_CO2_KG = 520;
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
    compact?: boolean;
};
export declare const REWARD_TOLERANCE = 0.25;
export declare function computeTravelMinutes(speedKnots: number): number;
export declare function computeMinutesDelta(speedKnots: number): number;
export declare function computeReductionPct(speedKnots: number): number;
export declare function computeCo2DeltaKg(speedKnots: number): number;
export declare function isRewardUnlocked(config: WidgetVariantConfig, value: number): boolean;
export default function WidgetVariant({ config, value, onValueChange, compact }: WidgetVariantProps): import("react/jsx-runtime").JSX.Element;
