"use client";

import { Card, Input, Label, Separator } from "@neon/ui";

import type { SectionDescriptor, ViewMode } from "@/lib/entity-page/types";

interface DetailsTabProps {
  sections: SectionDescriptor[];
  record: Record<string, unknown> | null;
  viewMode: ViewMode;
}

export function DetailsTab({ sections, record, viewMode }: DetailsTabProps) {
  if (sections.length === 0) {
    return (
      <div className="py-4 text-muted-foreground text-sm">
        No fields configured for this entity.
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {sections.map((section, idx) => (
        <div key={section.code}>
          {idx > 0 && <Separator className="mb-6" />}
          <SectionRenderer section={section} record={record} viewMode={viewMode} />
        </div>
      ))}
    </div>
  );
}

interface SectionRendererProps {
  section: SectionDescriptor;
  record: Record<string, unknown> | null;
  viewMode: ViewMode;
}

function SectionRenderer({ section, record, viewMode }: SectionRendererProps) {
  const gridCols = section.columns === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-4">{section.label}</h3>
      <div className={`grid ${gridCols} gap-4`}>
        {section.fields.map((fieldName) => (
          <FieldRenderer
            key={fieldName}
            fieldName={fieldName}
            value={record?.[fieldName]}
            viewMode={viewMode}
          />
        ))}
      </div>
    </Card>
  );
}

interface FieldRendererProps {
  fieldName: string;
  value: unknown;
  viewMode: ViewMode;
}

function FieldRenderer({ fieldName, value, viewMode }: FieldRendererProps) {
  const displayLabel = fieldName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const displayValue = value == null ? "" : String(value);

  if (viewMode === "view") {
    return (
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">{displayLabel}</Label>
        <p className="text-sm min-h-[1.5rem]">{displayValue || "\u2014"}</p>
      </div>
    );
  }

  // Edit / Create mode
  return (
    <div className="space-y-1">
      <Label htmlFor={fieldName}>{displayLabel}</Label>
      <Input
        id={fieldName}
        name={fieldName}
        defaultValue={displayValue}
      />
    </div>
  );
}
