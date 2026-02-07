"use client";

import { Card } from "@neon/ui";

interface ShortcutWidgetProps {
    params: {
        label_key: string;
        href: string;
        icon?: string;
        description_key?: string;
    };
    resolvedLabel?: string;
    resolvedDescription?: string;
}

export function ShortcutWidget({ params, resolvedLabel, resolvedDescription }: ShortcutWidgetProps) {
    const label = resolvedLabel ?? params.label_key;
    const description = resolvedDescription ?? params.description_key;

    return (
        <a href={params.href} className="block h-full no-underline">
            <Card>
                <div className="flex flex-col h-full p-4">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    {description && (
                        <p className="mt-1 text-xs text-gray-500">{description}</p>
                    )}
                </div>
            </Card>
        </a>
    );
}
