import { StubPage } from "@/components/stubs/StubPage";

export default function WorkflowStudioPage() {
    return (
        <StubPage
            epic={10}
            title="Workflow Studio"
            description="Design, manage, and version workflow templates. Configure approval chains, multi-stage routing, SLA policies, escalation rules, and automation triggers."
            route="/wb/:wb/mesh/workflow-studio"
        />
    );
}
