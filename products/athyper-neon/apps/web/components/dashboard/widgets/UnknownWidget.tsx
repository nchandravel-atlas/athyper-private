"use client";

import { Card } from "@neon/ui";

interface UnknownWidgetProps {
    widgetType: string;
    widgetId: string;
}

export function UnknownWidget({ widgetType, widgetId }: UnknownWidgetProps) {
    return (
        <Card>
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-sm font-medium text-amber-600">Unknown Widget</p>
                <p className="mt-1 text-xs text-gray-500">
                    Type &quot;{widgetType}&quot; is not registered
                </p>
                <p className="mt-1 text-xs text-gray-400">ID: {widgetId}</p>
            </div>
        </Card>
    );
}
