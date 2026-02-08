"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useMessages } from "@/lib/i18n/messages-context";

export function SearchDialog() {
    const [open, setOpen] = React.useState(false);
    const { t } = useMessages();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <Button
                variant="link"
                className="!px-0 font-normal text-muted-foreground hover:no-underline"
                onClick={() => setOpen(true)}
            >
                <Search className="size-4" />
                {t("common.header.search")}
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
                    <span className="text-xs">&#x2318;</span>J
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder={t("common.header.search_placeholder")} />
                <CommandList>
                    <CommandEmpty>{t("common.header.no_results")}</CommandEmpty>
                    <CommandGroup heading={t("common.header.quick_actions")}>
                        <CommandItem onSelect={() => setOpen(false)}>
                            <span>{t("common.header.go_to_dashboard")}</span>
                        </CommandItem>
                        <CommandItem onSelect={() => setOpen(false)}>
                            <span>{t("common.header.go_to_settings")}</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
