/**
 * @athyper/dashboard — meta-driven dashboard engine types, schemas, and registry.
 */

// Types
export type {
    Dashboard,
    DashboardVersion,
    DashboardAcl,
    DashboardLayout,
    LayoutItem,
    GridPosition,
    DashboardListItem,
    DashboardGroup,
    DashboardExport,
    TemplateItem,
    DashboardVersionSummary,
    Workbench,
    DashboardVisibility,
    DashboardVersionStatus,
    AclPrincipalType,
    AclPermission,
} from "./types/dashboard.types.js";

export type {
    WidgetType,
    WidgetDefinition,
    HeadingParams,
    SpacerParams,
    ShortcutParams,
    KpiParams,
    ListParams,
    ChartParams,
} from "./types/widget.types.js";
export { WIDGET_TYPES } from "./types/widget.types.js";

export type {
    DashboardContribution,
    DashboardContributionEntry,
    DashboardContributionAcl,
} from "./types/contribution.types.js";

export type {
    ResolutionTier,
    ResolvedDashboard,
    ResolutionContext,
} from "./types/resolution.types.js";

// Schemas
export {
    headingParamsSchema,
    spacerParamsSchema,
    shortcutParamsSchema,
    kpiParamsSchema,
    listParamsSchema,
    chartParamsSchema,
    widgetParamsSchemaMap,
} from "./schemas/widget-params.schema.js";

export {
    gridPositionSchema,
    layoutItemSchema,
    dashboardLayoutSchema,
    dashboardExportSchema,
} from "./schemas/layout.schema.js";

export {
    dashboardContributionSchema,
} from "./schemas/contribution.schema.js";

// Registry
export { WidgetRegistry } from "./registry/widget-registry.js";
export { createStandardWidgetRegistry, standardWidgets } from "./registry/standard-widgets.js";

// Resolution
export { resolveDashboard } from "./resolution/resolve-dashboard.js";
export type { ResolutionCandidate } from "./resolution/resolve-dashboard.js";
