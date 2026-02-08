import { StubPage } from "@/components/stubs/StubPage";

export default function ApprovalsPage() {
    return <StubPage epic={6} title="Approvals" description="Manage approval requests for this record." route="/app/:entity/:id/approvals" />;
}
