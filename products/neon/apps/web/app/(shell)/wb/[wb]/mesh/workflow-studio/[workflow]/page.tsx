import { StubPage } from "@/components/stubs/StubPage";

export default function WorkflowDetailPage() {
    return (
        <StubPage
            epic={10}
            title="Workflow Editor"
            description="Edit workflow stages, transitions, guard conditions, actions, and version history for this workflow template."
            route="/wb/:wb/mesh/workflow-studio/:workflow"
        />
    );
}
