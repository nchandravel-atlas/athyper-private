import { StubPage } from "@/components/stubs/StubPage";

export default function ApprovalDetailPage() {
    return <StubPage epic={6} title="Approval Detail" description="Review and act on an approval request." route="/app/:entity/:id/approvals/:approvalId" />;
}
