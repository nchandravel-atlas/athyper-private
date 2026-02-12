"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@neon/ui";

import { getTabPlugin } from "@/lib/entity-page/plugin-registry";
import { DetailsTab } from "./DetailsTab";

import type { ReactNode } from "react";
import type { TabPluginProps } from "@/lib/entity-page/plugin-registry";
import type { SectionDescriptor, TabDescriptor } from "@/lib/entity-page/types";

interface EntityTabBarProps extends TabPluginProps {
  tabs: TabDescriptor[];
  sections: SectionDescriptor[];
  record: Record<string, unknown> | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function EntityTabBar({
  tabs,
  sections,
  record,
  activeTab,
  onTabChange,
  ...pluginProps
}: EntityTabBarProps) {
  const enabledTabs = tabs.filter((t) => t.enabled);

  if (enabledTabs.length === 0) return null;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList variant="line">
        {enabledTabs.map((tab) => (
          <TabsTrigger key={tab.code} value={tab.code}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {enabledTabs.map((tab) => (
        <TabsContent key={tab.code} value={tab.code}>
          {renderTabContent(tab.code, sections, record, pluginProps)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function renderTabContent(
  tabCode: string,
  sections: SectionDescriptor[],
  record: Record<string, unknown> | null,
  pluginProps: TabPluginProps,
): ReactNode {
  // Built-in: details tab renders form sections
  if (tabCode === "details") {
    return <DetailsTab sections={sections} record={record} viewMode={pluginProps.dynamicDescriptor.resolvedViewMode} />;
  }

  // Check plugin registry for custom tab
  const plugin = getTabPlugin(tabCode);
  if (plugin) {
    const PluginComponent = plugin.component;
    return <PluginComponent {...pluginProps} />;
  }

  // Fallback for unregistered tabs
  return (
    <div className="py-4 text-muted-foreground text-sm">
      Tab &quot;{tabCode}&quot; is not yet implemented.
    </div>
  );
}
