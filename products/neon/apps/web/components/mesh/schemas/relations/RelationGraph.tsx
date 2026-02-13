"use client";

import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";

import type { RelationDefinition } from "@/lib/schema-manager/types";
import type { Edge, Node } from "@xyflow/react";

const EDGE_COLORS: Record<string, string> = {
    belongs_to: "#3b82f6",
    has_many: "#22c55e",
    m2m: "#a855f7",
};

const EDGE_LABELS: Record<string, string> = {
    belongs_to: "belongs_to",
    has_many: "has_many",
    m2m: "m2m",
};

interface RelationGraphProps {
    entityName: string;
    relations: RelationDefinition[];
    selectedId: string | null;
    onNodeClick?: (entityName: string) => void;
}

function buildNodesAndEdges(
    entityName: string,
    relations: RelationDefinition[],
    selectedId: string | null,
) {
    // Collect unique entities
    const entitySet = new Set<string>([entityName]);
    for (const rel of relations) {
        entitySet.add(rel.targetEntity);
    }

    const entities = Array.from(entitySet);
    const COLS = Math.ceil(Math.sqrt(entities.length));

    const nodes: Node[] = entities.map((name, i) => ({
        id: name,
        position: {
            x: (i % COLS) * 250,
            y: Math.floor(i / COLS) * 150,
        },
        data: {
            label: name,
        },
        ariaLabel: `Entity: ${name}${name === entityName ? " (current)" : ""}`,
        style: {
            background: name === entityName ? "#1d4ed8" : "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "13px",
            fontWeight: 600,
            minWidth: "120px",
            textAlign: "center" as const,
        },
    }));

    const edges: Edge[] = relations.map((rel) => ({
        id: rel.id,
        source: entityName,
        target: rel.targetEntity,
        label: `${EDGE_LABELS[rel.relationKind] ?? rel.relationKind}${rel.fkField ? ` (${rel.fkField})` : ""}`,
        type: rel.relationKind === "m2m" ? "straight" : "smoothstep",
        animated: selectedId === rel.id,
        ariaLabel: `${entityName} ${rel.relationKind} ${rel.targetEntity}${rel.fkField ? ` via ${rel.fkField}` : ""}`,
        style: {
            stroke: selectedId === rel.id ? "#f59e0b" : (EDGE_COLORS[rel.relationKind] ?? "#64748b"),
            strokeWidth: selectedId === rel.id ? 2.5 : 1.5,
        },
        labelStyle: {
            fontSize: 10,
            fill: "#94a3b8",
        },
        labelBgStyle: {
            fill: "#0f172a",
            fillOpacity: 0.8,
        },
        markerEnd: rel.relationKind !== "m2m" ? { type: "arrowclosed" as const } : undefined,
    }));

    return { nodes, edges };
}

export function RelationGraph({ entityName, relations, selectedId, onNodeClick }: RelationGraphProps) {
    const initial = useMemo(
        () => buildNodesAndEdges(entityName, relations, selectedId),
        [entityName, relations, selectedId],
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

    // Update when relations or selection changes
    useEffect(() => {
        const updated = buildNodesAndEdges(entityName, relations, selectedId);
        setNodes(updated.nodes);
        setEdges(updated.edges);
    }, [entityName, relations, selectedId, setNodes, setEdges]);

    return (
        <div
            className="h-full min-h-[400px] rounded-md border bg-slate-950"
            role="img"
            aria-label={`Entity relation graph for ${entityName} showing ${relations.length} relation${relations.length === 1 ? "" : "s"}`}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_event, node) => onNodeClick?.(node.id)}
                fitView
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#1e293b" gap={20} />
                <Controls
                    showInteractive={false}
                    className="[&>button]:bg-slate-800 [&>button]:border-slate-700 [&>button]:text-slate-300"
                />
                <MiniMap
                    nodeColor="#3b82f6"
                    maskColor="rgba(0,0,0,0.6)"
                    className="bg-slate-900 border-slate-700"
                />
            </ReactFlow>
        </div>
    );
}
