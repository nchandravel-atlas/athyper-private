"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FieldTypeIcon } from "./FieldTypeIcon";

import type { FieldDefinition } from "@/lib/schema-manager/types";

const SYSTEM_FIELDS = new Set([
    "id", "tenant_id", "realm_id",
    "created_at", "created_by", "updated_at", "updated_by",
]);

interface FieldRowProps {
    field: FieldDefinition;
    onEdit?: (field: FieldDefinition) => void;
    onDelete?: (field: FieldDefinition) => void;
}

export function FieldRow({ field, onEdit, onDelete }: FieldRowProps) {
    const isSystem = SYSTEM_FIELDS.has(field.name);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-3 rounded-md border px-3 py-2 transition-colors",
                isDragging && "z-10 shadow-lg bg-card",
                isSystem && "bg-muted/30",
                !isDragging && "hover:bg-muted/50",
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground"
                aria-label="Drag to reorder"
            >
                <GripVertical className="size-4" />
            </button>

            <FieldTypeIcon dataType={field.dataType} />

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium truncate">{field.name}</span>
                    {field.columnName !== field.name && (
                        <span className="text-xs text-muted-foreground font-mono truncate">
                            ({field.columnName})
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-xs font-mono">
                    {field.dataType}
                </Badge>
                {field.isRequired && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-700">
                        required
                    </Badge>
                )}
                {field.isUnique && (
                    <Badge variant="outline" className="text-xs text-purple-600 border-purple-300 dark:text-purple-400 dark:border-purple-700">
                        unique
                    </Badge>
                )}
                {field.isSearchable && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700">
                        searchable
                    </Badge>
                )}
                {field.isFilterable && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">
                        filterable
                    </Badge>
                )}
                {isSystem && (
                    <Badge variant="secondary" className="text-xs">
                        system
                    </Badge>
                )}
            </div>

            {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {onEdit && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(field)}>
                    <Pencil className="size-3.5" />
                </Button>
                )}
                {!isSystem && onDelete && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => onDelete(field)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                )}
            </div>
            )}
        </div>
    );
}
