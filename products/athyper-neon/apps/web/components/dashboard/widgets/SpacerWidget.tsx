"use client";

interface SpacerWidgetProps {
    params: {
        height: "sm" | "md" | "lg";
    };
}

const heightMap = {
    sm: "h-4",
    md: "h-8",
    lg: "h-12",
};

export function SpacerWidget({ params }: SpacerWidgetProps) {
    return <div className={heightMap[params.height]} role="presentation" aria-hidden="true" />;
}
