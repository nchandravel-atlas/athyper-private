import { StubPage } from "@/components/stubs/StubPage";

export default function DashboardsHubPage() {
    return <StubPage epic={4} title="Dashboards Hub" description="Browse and manage dashboards scoped to workbench, workspace, module, or entity." route="/wb/:wb/dashboards" />;
}
