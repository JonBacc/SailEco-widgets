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
export default function EcoWidget(props: EcoWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
