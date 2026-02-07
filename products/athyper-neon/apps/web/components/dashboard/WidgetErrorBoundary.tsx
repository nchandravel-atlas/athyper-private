"use client";

import { Component, type ReactNode } from "react";
import { Card } from "@neon/ui";

interface Props {
    widgetId: string;
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class WidgetErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Card>
                    <div role="alert" className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <p className="text-sm font-medium text-red-600">Widget Error</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Widget &quot;{this.props.widgetId}&quot; failed to render
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            {this.state.error?.message}
                        </p>
                    </div>
                </Card>
            );
        }

        return this.props.children;
    }
}
