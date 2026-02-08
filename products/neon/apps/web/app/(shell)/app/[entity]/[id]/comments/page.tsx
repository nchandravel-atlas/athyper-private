import { StubPage } from "@/components/stubs/StubPage";

export default function CommentsPage() {
    return <StubPage epic={6} title="Comments" description="View and add comments on this record." route="/app/:entity/:id/comments" />;
}
