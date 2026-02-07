"use client";

import { useState, useEffect } from "react";
import { useEditor } from "./EditorContext";
import { Button, Input, Select, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@neon/ui";
import type { LayoutItem } from "@athyper/dashboard";

interface WidgetConfigPanelProps {
    widgetId: string;
    onClose: () => void;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">{label}</label>
            {children}
        </div>
    );
}

function HeadingForm({ params, onChange }: { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
    return (
        <div className="space-y-3">
            <FieldGroup label="Text Key (i18n)">
                <Input
                    value={(params.text_key as string) ?? ""}
                    onChange={(e) => onChange({ ...params, text_key: e.target.value })}
                    placeholder="dashboard.MODULE.section.title"
                />
            </FieldGroup>
            <FieldGroup label="Level">
                <Select
                    value={(params.level as string) ?? "h2"}
                    onChange={(e) => onChange({ ...params, level: e.target.value })}
                >
                    <option value="h1">H1 — Large</option>
                    <option value="h2">H2 — Section</option>
                    <option value="h3">H3 — Subsection</option>
                    <option value="h4">H4 — Small</option>
                </Select>
            </FieldGroup>
        </div>
    );
}

function SpacerForm({ params, onChange }: { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
    return (
        <FieldGroup label="Height">
            <Select
                value={(params.height as string) ?? "md"}
                onChange={(e) => onChange({ ...params, height: e.target.value })}
            >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
            </Select>
        </FieldGroup>
    );
}

function ShortcutForm({ params, onChange }: { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
    return (
        <div className="space-y-3">
            <FieldGroup label="Label Key (i18n)">
                <Input value={(params.label_key as string) ?? ""} onChange={(e) => onChange({ ...params, label_key: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="URL">
                <Input value={(params.href as string) ?? ""} onChange={(e) => onChange({ ...params, href: e.target.value })} placeholder="/path/to/page" />
            </FieldGroup>
            <FieldGroup label="Icon (optional)">
                <Input value={(params.icon as string) ?? ""} onChange={(e) => onChange({ ...params, icon: e.target.value })} placeholder="lucide icon name" />
            </FieldGroup>
            <FieldGroup label="Description Key (optional)">
                <Input value={(params.description_key as string) ?? ""} onChange={(e) => onChange({ ...params, description_key: e.target.value })} />
            </FieldGroup>
        </div>
    );
}

function KpiForm({ params, onChange }: { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
    return (
        <div className="space-y-3">
            <FieldGroup label="Label Key (i18n)">
                <Input value={(params.label_key as string) ?? ""} onChange={(e) => onChange({ ...params, label_key: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Query Key">
                <Input value={(params.query_key as string) ?? ""} onChange={(e) => onChange({ ...params, query_key: e.target.value })} placeholder="module.metric_name" />
            </FieldGroup>
            <FieldGroup label="Format">
                <Select value={(params.format as string) ?? "number"} onChange={(e) => onChange({ ...params, format: e.target.value })}>
                    <option value="number">Number</option>
                    <option value="currency">Currency</option>
                    <option value="percent">Percent</option>
                </Select>
            </FieldGroup>
            {params.format === "currency" && (
                <FieldGroup label="Currency Code">
                    <Input value={(params.currency_code as string) ?? "USD"} onChange={(e) => onChange({ ...params, currency_code: e.target.value })} placeholder="USD" />
                </FieldGroup>
            )}
            <FieldGroup label="Trend Query Key (optional)">
                <Input value={(params.trend_query_key as string) ?? ""} onChange={(e) => onChange({ ...params, trend_query_key: e.target.value })} />
            </FieldGroup>
        </div>
    );
}

function ListForm({ params, onChange }: { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
    return (
        <div className="space-y-3">
            <FieldGroup label="Title Key (i18n)">
                <Input value={(params.title_key as string) ?? ""} onChange={(e) => onChange({ ...params, title_key: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Query Key">
                <Input value={(params.query_key as string) ?? ""} onChange={(e) => onChange({ ...params, query_key: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Columns (comma-separated)">
                <Input
                    value={Array.isArray(params.columns) ? (params.columns as string[]).join(", ") : ""}
                    onChange={(e) => onChange({ ...params, columns: e.target.value.split(",").map((c: string) => c.trim()).filter(Boolean) })}
                    placeholder="date, reference, description, amount"
                />
            </FieldGroup>
            <FieldGroup label="Page Size">
                <Input
                    type="number"
                    value={(params.page_size as number) ?? 5}
                    onChange={(e) => onChange({ ...params, page_size: parseInt(e.target.value) || 5 })}
                    min={1}
                    max={50}
                />
            </FieldGroup>
            <FieldGroup label="Link Template (optional)">
                <Input value={(params.link_template as string) ?? ""} onChange={(e) => onChange({ ...params, link_template: e.target.value })} placeholder="/entity/{id}" />
            </FieldGroup>
        </div>
    );
}

function ChartForm({ params, onChange }: { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
    return (
        <div className="space-y-3">
            <FieldGroup label="Title Key (i18n)">
                <Input value={(params.title_key as string) ?? ""} onChange={(e) => onChange({ ...params, title_key: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Query Key">
                <Input value={(params.query_key as string) ?? ""} onChange={(e) => onChange({ ...params, query_key: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Chart Type">
                <Select value={(params.chart_type as string) ?? "bar"} onChange={(e) => onChange({ ...params, chart_type: e.target.value })}>
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="pie">Pie Chart</option>
                </Select>
            </FieldGroup>
        </div>
    );
}

export function WidgetConfigPanel({ widgetId, onClose }: WidgetConfigPanelProps) {
    const { state, dispatch } = useEditor();
    const widget = state.layout.items.find((i) => i.id === widgetId);
    const [localParams, setLocalParams] = useState<Record<string, unknown>>(widget?.params ?? {});

    useEffect(() => {
        if (widget) setLocalParams({ ...widget.params });
    }, [widget]);

    if (!widget) return null;

    function handleSave() {
        dispatch({ type: "UPDATE_PARAMS", widgetId, params: localParams });
        onClose();
    }

    function renderForm() {
        switch (widget!.widget_type) {
            case "heading": return <HeadingForm params={localParams} onChange={setLocalParams} />;
            case "spacer": return <SpacerForm params={localParams} onChange={setLocalParams} />;
            case "shortcut": return <ShortcutForm params={localParams} onChange={setLocalParams} />;
            case "kpi": return <KpiForm params={localParams} onChange={setLocalParams} />;
            case "list": return <ListForm params={localParams} onChange={setLocalParams} />;
            case "chart": return <ChartForm params={localParams} onChange={setLocalParams} />;
            default:
                return <p className="text-sm text-gray-400">No configuration for type "{widget!.widget_type}"</p>;
        }
    }

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>
                        Configure {widget.widget_type.charAt(0).toUpperCase() + widget.widget_type.slice(1)} Widget
                    </DialogTitle>
                    <p className="text-xs text-gray-400">ID: {widget.id}</p>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto">
                    {renderForm()}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
