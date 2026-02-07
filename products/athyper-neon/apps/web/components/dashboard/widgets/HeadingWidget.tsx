"use client";

interface HeadingWidgetProps {
    params: {
        text_key: string;
        level: "h1" | "h2" | "h3" | "h4";
    };
    /** Resolved i18n text (resolved by parent from text_key) */
    resolvedText?: string;
}

export function HeadingWidget({ params, resolvedText }: HeadingWidgetProps) {
    const text = resolvedText ?? params.text_key;
    const Tag = params.level;

    const sizeClasses = {
        h1: "text-2xl font-bold",
        h2: "text-xl font-semibold",
        h3: "text-lg font-medium",
        h4: "text-base font-medium",
    };

    return <Tag className={sizeClasses[Tag]}>{text}</Tag>;
}
