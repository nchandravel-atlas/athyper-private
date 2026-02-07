"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Input,
    Textarea,
    Label,
    Select,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@neon/ui";
import { createDashboard, fetchTemplates, duplicateDashboard } from "../../lib/dashboard/dashboard-client";
import type { TemplateItem } from "../../lib/dashboard/dashboard-client";

interface CreateDashboardDialogProps {
    open: boolean;
    onClose: () => void;
    workbench: string;
    moduleOptions: string[];
    onCreated?: (id: string) => void;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

export function CreateDashboardDialog({
    open,
    onClose,
    workbench,
    moduleOptions,
    onCreated,
}: CreateDashboardDialogProps) {
    const router = useRouter();
    const [tab, setTab] = useState("blank");
    const [title, setTitle] = useState("");
    const [code, setCode] = useState("");
    const [codeManual, setCodeManual] = useState(false);
    const [description, setDescription] = useState("");
    const [moduleCode, setModuleCode] = useState(moduleOptions[0] ?? "");
    const [icon, setIcon] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Template state
    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    function handleTitleChange(value: string) {
        setTitle(value);
        if (!codeManual) {
            setCode(slugify(value));
        }
    }

    function handleCodeChange(value: string) {
        setCodeManual(true);
        setCode(value);
    }

    function resetForm() {
        setTitle("");
        setCode("");
        setCodeManual(false);
        setDescription("");
        setModuleCode(moduleOptions[0] ?? "");
        setIcon("");
        setTab("blank");
        setSelectedTemplate(null);
    }

    // Fetch templates when tab switches to "template"
    useEffect(() => {
        if (tab === "template" && templates.length === 0 && !templatesLoading) {
            setTemplatesLoading(true);
            fetchTemplates(workbench)
                .then(setTemplates)
                .catch(() => {/* silent — empty list shown */})
                .finally(() => setTemplatesLoading(false));
        }
    }, [tab, workbench, templates.length, templatesLoading]);

    async function handleSubmit() {
        if (tab === "template") {
            if (!selectedTemplate) {
                toast.error("Select a template first");
                return;
            }
            setIsSubmitting(true);
            try {
                const result = await duplicateDashboard(selectedTemplate);
                toast.success("Dashboard created from template");
                resetForm();
                onClose();
                if (onCreated) {
                    onCreated(result.id);
                } else {
                    router.push(`/wb/${workbench}/dashboard/${result.id}/edit`);
                }
            } catch {
                toast.error("Failed to create from template");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (!title.trim() || !code.trim() || !moduleCode.trim()) {
            toast.error("Title, code, and module are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createDashboard({
                code: code.trim(),
                titleKey: title.trim(),
                descriptionKey: description.trim() || undefined,
                moduleCode: moduleCode.trim(),
                workbench,
                icon: icon.trim() || undefined,
            });
            toast.success("Dashboard created");
            resetForm();
            onClose();
            if (onCreated) {
                onCreated(result.id);
            } else {
                router.push(`/wb/${workbench}/dashboard/${result.id}/edit`);
            }
        } catch {
            toast.error("Failed to create dashboard");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    resetForm();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>New Dashboard</DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="w-full">
                        <TabsTrigger value="blank" className="flex-1">Blank</TabsTrigger>
                        <TabsTrigger value="template" className="flex-1">From Template</TabsTrigger>
                    </TabsList>

                    <TabsContent value="blank">
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="db-title">Title</Label>
                                <Input
                                    id="db-title"
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="My Dashboard"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="db-code">Code</Label>
                                <Input
                                    id="db-code"
                                    value={code}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    placeholder="my_dashboard"
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-gray-400">
                                    Unique identifier. Auto-generated from title.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="db-module">Module</Label>
                                <Select
                                    id="db-module"
                                    value={moduleCode}
                                    onChange={(e) => setModuleCode(e.target.value)}
                                >
                                    {moduleOptions.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="db-desc">Description (optional)</Label>
                                <Textarea
                                    id="db-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of this dashboard"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="db-icon">Icon (optional)</Label>
                                <Input
                                    id="db-icon"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="layout-dashboard"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="template">
                        <div className="py-2">
                            {templatesLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="py-8 text-center text-sm text-gray-400">
                                    No templates available for this workbench.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">
                                    {templates.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => setSelectedTemplate(tpl.id)}
                                            className={`text-left p-3 rounded-md border transition-colors ${
                                                selectedTemplate === tpl.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {tpl.titleKey}
                                            </p>
                                            {tpl.descriptionKey && (
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {tpl.descriptionKey}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {tpl.widgetCount} widget{tpl.widgetCount !== 1 ? "s" : ""}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => { resetForm(); onClose(); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (tab === "template" && !selectedTemplate)}
                    >
                        {isSubmitting
                            ? "Creating..."
                            : tab === "template"
                                ? "Create from Template"
                                : "Create Dashboard"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
